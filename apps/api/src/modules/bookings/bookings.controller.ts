import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CancelBookingDto, RescheduleBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.createBooking(dto, req.user);
  }

  @Get('search')
  searchBookings(@Query('q') query: string) {
    return this.bookingsService.searchBookings(query || '');
  }

  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  @Post(':id/cancel')
  cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @Req() req: any,
  ) {
    return this.bookingsService.cancelBooking(id, dto, req.user);
  }

  @Post(':id/reschedule')
  rescheduleBooking(
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
    @Req() req: any,
  ) {
    return this.bookingsService.rescheduleBooking(id, dto, req.user);
  }
}
