import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async reserveSeats(
    tripId: string,
    fromStopId: string,
    toStopId: string,
    seatIds: string[],
    passengerId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const segments = await tx.tripSegment.findMany({
        where: { tripId },
        include: { fromStop: true, toStop: true },
        orderBy: { sequenceNumber: 'asc' },
      });

      const targetFrom = fromStopId.toUpperCase().trim();
      const targetTo = toStopId.toUpperCase().trim();

      const fromIndex = segments.findIndex(
        (s) =>
          s.fromStopId === fromStopId ||
          s.fromStop?.code?.toUpperCase() === targetFrom ||
          s.fromStopId === `stop_${targetFrom}`,
      );

      const toIndex = segments.findIndex(
        (s) =>
          s.toStopId === toStopId ||
          s.toStop?.code?.toUpperCase() === targetTo ||
          s.toStopId === `stop_${targetTo}`,
      );

      if (
        fromIndex === -1 ||
        toIndex === -1 ||
        fromIndex > toIndex
      ) {
        throw new BadRequestException('Invalid journey');
      }

      const requiredSegments = segments.filter(
        (_, index) => index >= fromIndex && index <= toIndex,
      );

      const reservation = await tx.reservation.create({
        data: {
          tripId,
          passengerId,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute TTL
        },
      });

      for (const seatId of seatIds) {
        for (const segment of requiredSegments) {
          const seat = await tx.tripSegmentSeat.findUnique({
            where: {
              tripSegmentId_busSeatId: {
                tripSegmentId: segment.id,
                busSeatId: seatId,
              },
            },
          });

          if (!seat || seat.status !== 'AVAILABLE') {
            throw new BadRequestException(
              `Seat ${seatId} is no longer available`,
            );
          }

          await tx.tripSegmentSeat.update({
            where: {
              id: seat.id,
            },
            data: {
              status: 'HELD',
              reservationId: reservation.id,
              heldUntil: reservation.expiresAt,
            },
          });
        }
      }

      return {
        reservationId: reservation.id,
        expiresAt: reservation.expiresAt,
        seats: seatIds.map((s) => ({
          seat: s,
          status: 'HELD',
        })),
      };
    });
  }

  async getReservation(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          },
        },
        seats: {
          include: {
            busSeat: true,
            tripSegment: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async cancelReservation(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }

      await tx.tripSegmentSeat.updateMany({
        where: { reservationId: id },
        data: {
          status: 'AVAILABLE',
          reservationId: null,
          heldUntil: null,
        },
      });

      return tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }
}
