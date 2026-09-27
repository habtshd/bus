import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { CreateBusTypeDto } from './dto/create-bus-type.dto';
import { ConfigureSeatsDto } from './dto/configure-seats.dto';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  createBus(@Body() dto: CreateBusDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.busesService.createBus(dto, companyId);
  }

  @Get()
  getAllBuses(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.busesService.getAllBuses(companyId);
  }

  @Get(':id')
  getBusById(@Param('id') id: string) {
    return this.busesService.getBusById(id);
  }

  @Post(':id/seats')
  configureSeats(@Param('id') busId: string, @Body() dto: ConfigureSeatsDto) {
    return this.busesService.configureSeats(busId, dto);
  }
}

@Controller('bus-types')
export class BusTypesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  createBusType(@Body() dto: CreateBusTypeDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.busesService.createBusType(dto, companyId);
  }

  @Get()
  getAllBusTypes(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.busesService.getAllBusTypes(companyId);
  }
}
