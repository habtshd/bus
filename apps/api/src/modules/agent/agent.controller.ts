import {
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('trips/today')
  getTodayTrips(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    const branchId = req.user?.branchId || req.headers?.['x-branch-id'];
    return this.agentService.getTodayTrips(companyId, branchId);
  }

  @Get('sales')
  getAgentDailySales(@Req() req: any) {
    const agentId = req.user?.userId;
    const branchId = req.user?.branchId;
    return this.agentService.getAgentDailySales(agentId, branchId);
  }

  @Get('settlement')
  getBranchSettlement(@Req() req: any, @Query('branchId') qBranchId?: string) {
    const branchId = qBranchId || req.user?.branchId || 'default-branch';
    return this.agentService.getBranchSettlement(branchId);
  }

  @Get('passengers/search')
  searchPassengers(@Query('q') query: string) {
    return this.agentService.searchPassengers(query || '');
  }
}
