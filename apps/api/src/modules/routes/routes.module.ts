import { Module } from '@nestjs/common';
import { RoutesController, StopsController, SchedulesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  controllers: [RoutesController, StopsController, SchedulesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
