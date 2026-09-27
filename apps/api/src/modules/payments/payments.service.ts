import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/database/prisma.service';
import { PaymentProvider } from './payment-provider.interface';
import { TelebirrProvider } from './providers/telebirr.provider';
import { ChapaProvider } from './providers/chapa.provider';
import { CashProvider } from './providers/cash.provider';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly providers = new Map<string, PaymentProvider>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telebirr: TelebirrProvider,
    private readonly chapa: ChapaProvider,
    private readonly cash: CashProvider,
  ) {
    this.providers.set('TELEBIRR', this.telebirr);
    this.providers.set('CHAPA', this.chapa);
    this.providers.set('CASH', this.cash);
    this.providers.set('CHAPA_GATEWAY', this.chapa);
    this.providers.set('CBE_BIRR', this.telebirr); // Emulated telecom interface
  }

  getProvider(method: string): PaymentProvider {
    const key = method.toUpperCase().trim();
    const provider = this.providers.get(key) || this.chapa;
    return provider;
  }

  async initiatePayment(bookingId: string, method: string = 'TELEBIRR') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: true,
        trip: { include: { route: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    const provider = this.getProvider(method);
    const result = await provider.initiatePayment({
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      amount: booking.totalAmountETB,
      currency: booking.currency || 'ETB',
      customerPhone: booking.customerPhone,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || undefined,
    });

    // Create payment record in PENDING status
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        paymentReference: result.paymentReference,
        amountETB: booking.totalAmountETB,
        currency: 'ETB',
        provider: provider.providerName,
        paymentMethod: method,
        transactionReference: result.providerTxId || null,
        status: result.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING',
        paidAt: new Date(),
      },
    });

    return {
      bookingId: booking.id,
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      status: payment.status,
      checkoutUrl: result.checkoutUrl,
      provider: provider.providerName,
      amount: payment.amountETB,
    };
  }

  async processWebhook(payload: any, signature?: string) {
    const txId = payload.transactionId || payload.transaction_id || payload.tx_ref || payload.id;
    const paymentRef = payload.paymentReference || payload.reference || payload.ref;

    if (!txId && !paymentRef) {
      throw new BadRequestException('Invalid webhook payload: missing transaction identifier');
    }

    // Webhook Idempotency Check: Prevent duplicate payment processing
    const existingEvent = await this.prisma.paymentEvent.findFirst({
      where: {
        providerReference: String(txId || paymentRef),
      },
    });

    if (existingEvent) {
      this.logger.log(`Idempotent webhook acknowledged for providerReference: ${txId || paymentRef}`);
      return { success: true, message: 'Event already processed' };
    }

    // Lookup payment by reference or transaction reference
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          paymentRef ? { paymentReference: String(paymentRef) } : undefined,
          txId ? { transactionReference: String(txId) } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        booking: {
          include: {
            passengers: true,
            bookingSegments: true,
            trip: {
              include: {
                route: { include: { originStop: true, destinationStop: true } },
                bus: { include: { seats: true } },
                tripSegments: { include: { fromStop: true, toStop: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Associated payment record not found');
    }

    // Log the immutable audit event
    await this.prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: 'PAYMENT_SUCCESS',
        providerReference: String(txId || paymentRef),
        payloadJson: JSON.stringify(payload),
      },
    });

    // Execute atomic confirmation of booking, inventory and tickets
    return this.confirmPayment(payment.id, String(txId || paymentRef));
  }

  async confirmPayment(paymentId: string, externalTxRef?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              passengers: true,
              bookingSegments: true,
              trip: {
                include: {
                  route: { include: { originStop: true, destinationStop: true } },
                  bus: { include: { seats: true } },
                  tripSegments: { include: { fromStop: true, toStop: true } },
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      if (payment.status === 'COMPLETED' || payment.status === 'SUCCESS') {
        return payment;
      }

      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionReference: externalTxRef || payment.transactionReference,
          paidAt: new Date(),
        },
      });

      // Update master booking record
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'COMPLETED',
        },
      });

      const booking = payment.booking;
      const trip = booking.trip;
      const traversedSegmentIds = booking.bookingSegments.map((bs) => bs.tripSegmentId);

      // Lock & confirm all traversed segment seats to BOOKED
      for (const passenger of booking.passengers) {
        const physicalSeat = trip.bus.seats.find((s) => s.seatNumber === passenger.seatNumber);
        if (physicalSeat) {
          for (const segId of traversedSegmentIds) {
            await tx.tripSegmentSeat.update({
              where: {
                tripSegmentId_busSeatId: {
                  tripSegmentId: segId,
                  busSeatId: physicalSeat.id,
                },
              },
              data: {
                status: 'BOOKED',
                reservationId: null,
                heldUntil: null,
              },
            });
          }
        }
      }

      // Issue Tickets with Cryptographic Signed QR Hashes if not yet issued
      const existingTickets = await tx.ticket.findMany({
        where: { bookingId: booking.id },
      });

      if (existingTickets.length === 0) {
        const sortedSegs = trip.tripSegments
          .filter((s) => traversedSegmentIds.includes(s.id))
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        const boardingTerminal = sortedSegs[0]?.fromStop?.name || trip.route.originStop.name;
        const dropoffTerminal = sortedSegs[sortedSegs.length - 1]?.toStop?.name || trip.route.destinationStop.name;

        for (const passenger of booking.passengers) {
          const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
          const qrToken = `ABY-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
          const qrHash = crypto
            .createHash('sha256')
            .update(`${ticketNumber}:${booking.bookingReference}:${passenger.seatNumber}:${trip.id}`)
            .digest('hex');

          await tx.ticket.create({
            data: {
              ticketNumber,
              bookingId: booking.id,
              bookingPassengerId: passenger.id,
              tripId: trip.id,
              seatNumber: passenger.seatNumber,
              passengerName: passenger.passengerName,
              passengerPhone: passenger.passengerPhone,
              passengerIdNumber: passenger.passengerIdNumber || 'N/A',
              fareETB: booking.totalAmountETB / booking.passengers.length,
              qrHash,
              qrToken,
              status: 'ISSUED',
              boardingTerminal,
              dropoffTerminal,
            },
          });
        }
      }

      return {
        ...payment,
        status: 'COMPLETED',
        transactionReference: externalTxRef || payment.transactionReference,
        paidAt: new Date(),
      };
    });
  }
}
