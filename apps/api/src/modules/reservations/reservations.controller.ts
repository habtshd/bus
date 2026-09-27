import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  reserveSeats(@Body() dto: CreateReservationDto, @Req() req: any) {
    const passengerId = dto.passengerId || req.user?.passengerId;
    return this.reservationsService.reserveSeats(
      dto.tripId,
      dto.fromStopId,
      dto.toStopId,
      dto.seatIds,
      passengerId,
    );
  }

  @Get(':id')
  getReservation(@Param('id') id: string) {
    return this.reservationsService.getReservation(id);
  }

  @Delete(':id')
  cancelReservation(@Param('id') id: string) {
    return this.reservationsService.cancelReservation(id);
  }
}
