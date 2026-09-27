import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { EndShiftDto, StartShiftDto } from './dto/start-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('start')
  startShift(@Body() dto: StartShiftDto, @Req() req: any) {
    return this.shiftsService.startShift(dto, req.user);
  }

  @Post('end')
  endShift(@Body() dto: EndShiftDto, @Req() req: any) {
    return this.shiftsService.endShift(dto, req.user);
  }

  @Get('current')
  getCurrentShift(@Req() req: any) {
    return this.shiftsService.getCurrentShift(req.user);
  }

  @Get('history')
  getShiftHistory(
    @Query('branchId') branchId?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.shiftsService.getShiftHistory(branchId, agentId);
  }
}
