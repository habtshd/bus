import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async createBranch(dto: CreateBranchDto, resolvedCompanyId?: string) {
    const targetCompanyId = dto.companyId || resolvedCompanyId;
    if (!targetCompanyId) {
      // If company not provided, use the first available company in the system
      const company = await this.prisma.company.findFirst();
      if (!company) {
        throw new BadRequestException('No company found. Please create a company first.');
      }
      return this.persistBranch(dto, company.id);
    }
    return this.persistBranch(dto, targetCompanyId);
  }

  private async persistBranch(dto: CreateBranchDto, companyId: string) {
    const nameEn = dto.nameEn || dto.name || 'Terminal Branch';
    const nameAm = dto.nameAm || nameEn;
    const phone = dto.phone || '+251 11 000 0000';
    const address = dto.address || `${dto.city}, Ethiopia`;
    const terminalArea = dto.terminalArea || `${dto.city} Central Terminal`;

    return this.prisma.branch.create({
      data: {
        companyId,
        name: nameEn,
        nameEn,
        nameAm,
        code: dto.code || null,
        city: dto.city,
        terminalArea,
        phone,
        email: dto.email || null,
        address,
        managerName: dto.managerName || null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        status: 'ACTIVE',
      },
      include: {
        company: true,
      },
    });
  }

  async getAllBranches(companyId?: string) {
    return this.prisma.branch.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        company: true,
        users: true,
      },
      orderBy: { city: 'asc' },
    });
  }

  async getBranchById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        company: true,
        users: true,
        busesStationed: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }
}
