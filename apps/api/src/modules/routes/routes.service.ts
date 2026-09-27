import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // STOPS
  // =========================================================================
  async createStop(dto: CreateStopDto, resolvedCompanyId?: string) {
    const companyId = dto.companyId || resolvedCompanyId || (await this.getDefaultCompanyId());

    return this.prisma.stop.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code.toUpperCase().trim(),
        city: dto.city || dto.name,
        address: dto.address || `${dto.city || dto.name} Bus Terminal`,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        type: (dto.type as any) || 'TERMINAL',
        status: 'ACTIVE',
      },
    });
  }

  async getAllStops(companyId?: string) {
    return this.prisma.stop.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  // =========================================================================
  // ROUTES & ROUTE STOPS
  // =========================================================================
  async createRoute(dto: CreateRouteDto, resolvedCompanyId?: string) {
    const companyId = dto.companyId || resolvedCompanyId || (await this.getDefaultCompanyId());

    // Validate origin and destination stops
    const originStop = await this.prisma.stop.findUnique({ where: { id: dto.originStopId } });
    const destStop = await this.prisma.stop.findUnique({ where: { id: dto.destinationStopId } });

    if (!originStop || !destStop) {
      throw new BadRequestException('Origin or destination stop not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          companyId,
          routeCode: dto.routeCode.trim(),
          originStopId: dto.originStopId,
          destinationStopId: dto.destinationStopId,
          distanceKm: dto.distanceKm || 500,
          estimatedDurationMin: dto.estimatedDurationMinutes || 480,
          status: 'ACTIVE',
        },
      });

      // Prepare sequential stops
      let sequence = 1;
      const stopsToInsert: { stopId: string; sequenceNumber: number }[] = [];

      if (dto.routeStops && dto.routeStops.length > 0) {
        for (const s of dto.routeStops) {
          stopsToInsert.push({ stopId: s.stopId, sequenceNumber: s.sequenceNumber });
        }
      } else {
        // Origin stop is sequence 1
        stopsToInsert.push({ stopId: dto.originStopId, sequenceNumber: sequence++ });

        // Intermediate stops
        if (dto.intermediateStopIds && dto.intermediateStopIds.length > 0) {
          for (const intStopId of dto.intermediateStopIds) {
            stopsToInsert.push({ stopId: intStopId, sequenceNumber: sequence++ });
          }
        }

        // Destination stop is final sequence
        stopsToInsert.push({ stopId: dto.destinationStopId, sequenceNumber: sequence++ });
      }

      await tx.routeStop.createMany({
        data: stopsToInsert.map((s) => ({
          routeId: route.id,
          stopId: s.stopId,
          sequenceNumber: s.sequenceNumber,
        })),
      });

      return tx.route.findUnique({
        where: { id: route.id },
        include: {
          originStop: true,
          destinationStop: true,
          routeStops: {
            orderBy: { sequenceNumber: 'asc' },
            include: { stop: true },
          },
        },
      });
    });
  }

  async getAllRoutes(companyId?: string) {
    return this.prisma.route.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        originStop: true,
        destinationStop: true,
        routeStops: {
          orderBy: { sequenceNumber: 'asc' },
          include: { stop: true },
        },
        schedules: true,
      },
      orderBy: { routeCode: 'asc' },
    });
  }

  async getRouteById(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        originStop: true,
        destinationStop: true,
        routeStops: {
          orderBy: { sequenceNumber: 'asc' },
          include: { stop: true },
        },
        schedules: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  // =========================================================================
  // SCHEDULES
  // =========================================================================
  async createSchedule(dto: CreateScheduleDto) {
    const daysString = Array.isArray(dto.daysOfWeek) ? dto.daysOfWeek.join(',') : dto.daysOfWeek;

    return this.prisma.schedule.create({
      data: {
        routeId: dto.routeId,
        defaultBusTypeId: dto.busTypeId || null,
        departureTime: dto.departureTime,
        daysOfWeek: daysString,
        defaultPrice: dto.defaultPrice,
        status: 'ACTIVE',
      },
      include: {
        route: {
          include: { originStop: true, destinationStop: true },
        },
        defaultBusType: true,
      },
    });
  }

  async getAllSchedules(companyId?: string) {
    return this.prisma.schedule.findMany({
      where: companyId ? { route: { companyId } } : undefined,
      include: {
        route: {
          include: { originStop: true, destinationStop: true },
        },
        defaultBusType: true,
      },
      orderBy: { departureTime: 'asc' },
    });
  }

  private async getDefaultCompanyId(): Promise<string> {
    const comp = await this.prisma.company.findFirst();
    if (!comp) {
      throw new BadRequestException('No company configured. Please create a company first.');
    }
    return comp.id;
  }
}
