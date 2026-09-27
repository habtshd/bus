import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { EndShiftDto, StartShiftDto } from './dto/start-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async startShift(dto: StartShiftDto, currentUser: any) {
    const agentId = currentUser?.userId;
    if (!agentId) {
      throw new BadRequestException('Agent identification required');
    }

    const branchId = dto.branchId || currentUser?.branchId;
    if (!branchId) {
      throw new BadRequestException('Branch ID required');
    }

    // Check if agent already has an open shift
    const existing = await this.prisma.cashShift.findFirst({
      where: { agentId, status: 'OPEN' },
    });

    if (existing) {
      throw new BadRequestException('Agent already has an active OPEN shift');
    }

    const shift = await this.prisma.cashShift.create({
      data: {
        agentId,
        branchId,
        openingCashETB: dto.openingCashETB,
        cashSalesETB: 0,
        ticketsCount: 0,
        cancelledTicketsCount: 0,
        refundsETB: 0,
        status: 'OPEN',
        notes: dto.notes || 'Shift opened',
      },
      include: {
        agent: true,
        branch: true,
      },
    });

    return {
      shiftId: shift.id,
      status: shift.status,
      openedAt: shift.openedAt,
      openingCashETB: shift.openingCashETB,
      branchName: shift.branch.nameEn,
      agentName: shift.agent.fullName,
    };
  }

  async endShift(dto: EndShiftDto, currentUser: any) {
    const agentId = currentUser?.userId;

    let shift: any = null;
    if (dto.shiftId) {
      shift = await this.prisma.cashShift.findUnique({
        where: { id: dto.shiftId },
        include: { agent: true, branch: true },
      });
    } else if (agentId) {
      shift = await this.prisma.cashShift.findFirst({
        where: { agentId, status: 'OPEN' },
        include: { agent: true, branch: true },
      });
    }

    if (!shift || shift.status !== 'OPEN') {
      throw new NotFoundException('No active open shift found to close');
    }

    const expectedCashETB = shift.openingCashETB + shift.cashSalesETB - shift.refundsETB;
    const differenceETB = dto.actualCashETB - expectedCashETB;

    const closed = await this.prisma.cashShift.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        notes: `${shift.notes ? shift.notes + ' | ' : ''}Closed: Actual=${dto.actualCashETB}, Expected=${expectedCashETB}, Diff=${differenceETB}. ${dto.notes || ''}`.trim(),
      },
      include: { agent: true, branch: true },
    });

    return {
      shiftId: closed.id,
      status: closed.status,
      openedAt: closed.openedAt,
      closedAt: closed.closedAt,
      openingCashETB: closed.openingCashETB,
      cashSalesETB: closed.cashSalesETB,
      refundsETB: closed.refundsETB,
      ticketsCount: closed.ticketsCount,
      cancelledTicketsCount: closed.cancelledTicketsCount,
      expectedCashETB,
      actualCashETB: dto.actualCashETB,
      differenceETB,
      discrepancyStatus:
        differenceETB === 0
          ? 'BALANCED'
          : differenceETB > 0
          ? 'OVERAGE'
          : 'SHORTAGE',
      agentName: closed.agent.fullName,
      branchName: closed.branch.nameEn,
    };
  }

  async getCurrentShift(currentUser: any) {
    const agentId = currentUser?.userId;
    if (!agentId) return null;

    const shift = await this.prisma.cashShift.findFirst({
      where: { agentId, status: 'OPEN' },
      include: { branch: true },
    });

    if (!shift) return null;

    const expectedCashETB = shift.openingCashETB + shift.cashSalesETB - shift.refundsETB;

    return {
      shiftId: shift.id,
      status: shift.status,
      openedAt: shift.openedAt,
      openingCashETB: shift.openingCashETB,
      cashSalesETB: shift.cashSalesETB,
      refundsETB: shift.refundsETB,
      ticketsCount: shift.ticketsCount,
      cancelledTicketsCount: shift.cancelledTicketsCount,
      expectedCashETB,
      branchName: shift.branch.nameEn,
    };
  }

  async getShiftHistory(branchId?: string, agentId?: string) {
    return this.prisma.cashShift.findMany({
      where: {
        branchId: branchId || undefined,
        agentId: agentId || undefined,
      },
      include: {
        agent: true,
        branch: true,
      },
      orderBy: { openedAt: 'desc' },
      take: 30,
    });
  }
}
