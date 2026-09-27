import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsExpirationWorker } from './reservations-expiration.worker';
import { ReservationsService } from './reservations.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsExpirationWorker],
  exports: [ReservationsService],
})
export class ReservationsModule {}
