import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ReservationsExpirationWorker {
  private readonly logger = new Logger(ReservationsExpirationWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleExpiredReservations() {
    const now = new Date();

    const expiredReservations = await this.prisma.reservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: now,
        },
      },
      select: { id: true },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    const ids = expiredReservations.map((r) => r.id);

    await this.prisma.$transaction([
      this.prisma.tripSegmentSeat.updateMany({
        where: {
          reservationId: { in: ids },
          status: 'HELD',
        },
        data: {
          status: 'AVAILABLE',
          reservationId: null,
          heldUntil: null,
        },
      }),
      this.prisma.reservation.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          status: 'EXPIRED',
        },
      }),
    ]);

    this.logger.log(`Expired ${ids.length} reservations and restored seats to AVAILABLE status.`);
  }
}
