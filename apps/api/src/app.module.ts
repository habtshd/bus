import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgentModule } from './modules/agent/agent.module';
import { BoardingModule } from './modules/boarding/boarding.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { TripsModule } from './modules/trips/trips.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    TripsModule,
    ReservationsModule,
    BookingsModule,
    BoardingModule,
    ShiftsModule,
    AgentModule,
  ],
})
export class AppModule {}
