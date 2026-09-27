import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateBusTypeDto } from './dto/create-bus-type.dto';
import { CreateBusDto } from './dto/create-bus.dto';
import { ConfigureSeatsDto, SeatItemDto } from './dto/configure-seats.dto';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // BUS TYPES
  // =========================================================================
  async createBusType(dto: CreateBusTypeDto, resolvedCompanyId?: string) {
    const companyId = dto.companyId || resolvedCompanyId || (await this.getDefaultCompanyId());

    return this.prisma.busType.create({
      data: {
        companyId,
        name: dto.name,
        manufacturer: dto.manufacturer,
        model: dto.model,
        capacity: dto.capacity,
        description: dto.description || null,
      },
    });
  }

  async getAllBusTypes(companyId?: string) {
    return this.prisma.busType.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        buses: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // =========================================================================
  // BUSES
  // =========================================================================
  async createBus(dto: CreateBusDto, resolvedCompanyId?: string) {
    const companyId = dto.companyId || resolvedCompanyId || (await this.getDefaultCompanyId());

    let capacity = dto.totalSeats || 45;
    let busModel = dto.busModel || 'Yutong ZK6122H';
    let busTypeEnum = dto.busType || 'LUXURY_2X2';

    if (dto.busTypeId) {
      const bt = await this.prisma.busType.findUnique({
        where: { id: dto.busTypeId },
      });
      if (bt) {
        capacity = bt.capacity;
        busModel = `${bt.manufacturer} ${bt.model}`;
      }
    }

    const sideNumber = dto.sideNumber || dto.fleetNumber || `SB-${Math.floor(100 + Math.random() * 900)}`;

    const bus = await this.prisma.bus.create({
      data: {
        companyId,
        busTypeId: dto.busTypeId || null,
        fleetNumber: dto.fleetNumber || sideNumber,
        plateNumber: dto.plateNumber,
        sideNumber,
        busModel,
        busType: busTypeEnum,
        totalSeats: capacity,
        status: 'AVAILABLE',
        currentBranchId: dto.currentBranchId || null,
      },
    });

    // Auto-generate standard physical seats if requested (default to true)
    if (dto.autoGenerateSeats !== false) {
      await this.generateStandardSeats(bus.id, capacity);
    }

    return this.getBusById(bus.id);
  }

  async generateStandardSeats(busId: string, capacity: number) {
    const seatsToCreate: any[] = [];
    const letters = ['A', 'B', 'C', 'D'];
    let count = 0;
    const fullRows = Math.floor(capacity / 4);
    const remainder = capacity % 4;

    for (let r = 1; r <= fullRows; r++) {
      for (let colIdx = 0; colIdx < 4; colIdx++) {
        const letter = letters[colIdx];
        const sNum = `${r < 10 ? '0' + r : r}${letter}`;
        seatsToCreate.push({
          busId,
          seatNumber: sNum,
          row: r,
          column: colIdx + 1,
          columnLetter: letter,
          seatType: 'REGULAR',
          isWindow: colIdx === 0 || colIdx === 3,
          isAisle: colIdx === 1 || colIdx === 2,
          isBackRow: r === fullRows && remainder === 0,
          status: 'AVAILABLE',
          active: true,
        });
        count++;
      }
    }

    // Handle last row / remainder seats (e.g. 45th seat as 12A or back row bench)
    if (remainder > 0) {
      const r = fullRows + 1;
      for (let colIdx = 0; colIdx < remainder; colIdx++) {
        const letter = letters[colIdx];
        const sNum = `${r < 10 ? '0' + r : r}${letter}`;
        seatsToCreate.push({
          busId,
          seatNumber: sNum,
          row: r,
          column: colIdx + 1,
          columnLetter: letter,
          seatType: 'REGULAR',
          isWindow: colIdx === 0,
          isAisle: false,
          isBackRow: true,
          status: 'AVAILABLE',
          active: true,
        });
      }
    }

    await this.prisma.seat.createMany({
      data: seatsToCreate,
      skipDuplicates: true,
    });
  }

  async configureSeats(busId: string, dto: ConfigureSeatsDto) {
    const bus = await this.prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    // Remove existing seats and recreate with new layout
    await this.prisma.seat.deleteMany({ where: { busId } });

    await this.prisma.seat.createMany({
      data: dto.seats.map((s) => ({
        busId,
        seatNumber: s.seatNumber,
        row: s.row,
        column: s.column,
        columnLetter: s.columnLetter,
        seatType: s.seatType || 'REGULAR',
        isWindow: s.isWindow ?? false,
        isAisle: s.isAisle ?? false,
        isBackRow: s.isBackRow ?? false,
        status: 'AVAILABLE',
        active: true,
      })),
    });

    // Update totalSeats on bus
    await this.prisma.bus.update({
      where: { id: busId },
      data: { totalSeats: dto.seats.length },
    });

    return this.getBusById(busId);
  }

  async getAllBuses(companyId?: string) {
    return this.prisma.bus.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        busTypeRef: true,
        seats: {
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
        },
      },
      orderBy: { sideNumber: 'asc' },
    });
  }

  async getBusById(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: {
        busTypeRef: true,
        seats: {
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
        },
        trips: {
          take: 5,
          orderBy: { scheduledDeparture: 'desc' },
        },
      },
    });

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }

    return bus;
  }

  private async getDefaultCompanyId(): Promise<string> {
    const comp = await this.prisma.company.findFirst();
    if (!comp) {
      throw new BadRequestException('No company configured. Please create a company first.');
    }
    return comp.id;
  }
}
