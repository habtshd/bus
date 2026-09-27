import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  createBranch(@Body() dto: CreateBranchDto, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.branchesService.createBranch(dto, companyId);
  }

  @Get()
  getAllBranches(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers?.['x-company-id'];
    return this.branchesService.getAllBranches(companyId);
  }

  @Get(':id')
  getBranchById(@Param('id') id: string) {
    return this.branchesService.getBranchById(id);
  }
}
