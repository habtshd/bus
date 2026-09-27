import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase().trim() },
          { phone: dto.phone.trim() },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('User with this email or phone number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        passwordHash,
        fullName: dto.fullName,
        role: dto.role || 'PASSENGER',
        branchId: dto.branchId || null,
        active: true,
      },
      include: {
        branch: {
          include: { company: true },
        },
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(branchId?: string, role?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        branchId: branchId || undefined,
        role: role || undefined,
      },
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(({ passwordHash, ...u }) => u);
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
