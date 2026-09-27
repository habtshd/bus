import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { BranchesModule } from './modules/branches/branches.module';
import { BusesModule } from './modules/buses/buses.module';
import { RoutesModule } from './modules/routes/routes.module';
import { TripsModule } from './modules/trips/trips.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BoardingModule } from './modules/boarding/boarding.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { AgentModule } from './modules/agent/agent.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    BranchesModule,
    BusesModule,
    RoutesModule,
    TripsModule,
    PricingModule,
    PaymentsModule,
    ReservationsModule,
    BookingsModule,
    BoardingModule,
    ShiftsModule,
    AgentModule,
  ],
})
export class AppModule {}
