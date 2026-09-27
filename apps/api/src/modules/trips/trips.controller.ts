import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  createTrip(@Body() dto: CreateTripDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'] || 'default-company-id';
    return this.tripsService.createTrip(dto, companyId);
  }

  @Get()
  getAllTrips(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.tripsService.getAllTrips(companyId);
  }

  @Get(':tripId')
  getTripById(@Param('tripId') tripId: string) {
    return this.tripsService.getTripById(tripId);
  }

  // GET /api/v1/trips/:tripId/seats?fromStopId=ADD&toStopId=DES
  @Get(':tripId/seats')
  getAvailableSeats(
    @Param('tripId') tripId: string,
    @Query('fromStopId') fromStopId: string,
    @Query('toStopId') toStopId: string,
  ) {
    return this.tripsService.getAvailableSeats(
      tripId,
      fromStopId,
      toStopId,
    );
  }
}
