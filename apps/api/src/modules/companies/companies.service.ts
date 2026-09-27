import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(dto: CreateCompanyDto) {
    const tradeName = dto.tradeName || dto.name || dto.legalName;
    const phone = dto.headquartersPhone || dto.phone || '+251 11 000 0000';
    const email = dto.supportEmail || dto.email || 'info@transport.et';

    return this.prisma.company.create({
      data: {
        name: tradeName,
        legalName: dto.legalName,
        legalNameAm: dto.legalNameAm || dto.legalName,
        tradeName,
        tinNumber: dto.tinNumber,
        commercialRegNo: dto.commercialRegNo || `MT/AA/${Date.now().toString().slice(-6)}`,
        headquartersAddress: dto.headquartersAddress || 'Addis Ababa, Ethiopia',
        headquartersPhone: phone,
        supportEmail: email,
        websiteUrl: dto.websiteUrl || null,
        status: 'ACTIVE',
      },
    });
  }

  async getAllCompanies() {
    return this.prisma.company.findMany({
      include: {
        branches: true,
        buses: true,
        routes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        branches: true,
        buses: true,
        routes: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }
}
