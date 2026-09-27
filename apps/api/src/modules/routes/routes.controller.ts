import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  createRoute(@Body() dto: CreateRouteDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.routesService.createRoute(dto, companyId);
  }

  @Get()
  getAllRoutes(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.routesService.getAllRoutes(companyId);
  }

  @Get(':id')
  getRouteById(@Param('id') id: string) {
    return this.routesService.getRouteById(id);
  }
}

@Controller('stops')
export class StopsController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  createStop(@Body() dto: CreateStopDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.routesService.createStop(dto, companyId);
  }

  @Get()
  getAllStops(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.routesService.getAllStops(companyId);
  }
}

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  createSchedule(@Body() dto: CreateScheduleDto) {
    return this.routesService.createSchedule(dto);
  }

  @Get()
  getAllSchedules(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.routesService.getAllSchedules(companyId);
  }
}
