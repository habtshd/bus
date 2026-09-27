import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { BoardingService } from './boarding.service';
import { ScanTicketDto } from './dto/scan-ticket.dto';

@Controller('boarding')
export class BoardingController {
  constructor(private readonly boardingService: BoardingService) {}

  @Post('scan')
  scanTicket(@Body() dto: ScanTicketDto, @Req() req: any) {
    return this.boardingService.scanTicket(dto, req.user);
  }

  @Get('manifest/:tripId')
  getTripManifest(@Param('tripId') tripId: string) {
    return this.boardingService.getTripManifest(tripId);
  }
}
