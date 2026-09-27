import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './common/database/database.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { TripsModule } from './modules/trips/trips.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    TripsModule,
    ReservationsModule,
  ],
})
export class AppModule {}
