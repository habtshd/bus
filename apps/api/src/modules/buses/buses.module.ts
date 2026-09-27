import { Module } from '@nestjs/common';
import { BusesController, BusTypesController } from './buses.controller';
import { BusesService } from './buses.service';

@Module({
  controllers: [BusesController, BusTypesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
