import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../common/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'ethiopian_bus_platform_jwt_secret_key_2026_secure';

  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const searchTarget = (dto.login || dto.email || dto.phone || '').trim();
    if (!searchTarget) {
      throw new BadRequestException('Please provide an email or phone number');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: searchTarget.toLowerCase() },
          { phone: searchTarget },
        ],
      },
      include: {
        branch: {
          include: { company: true },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      roles: [user.role],
      branchId: user.branchId,
      companyId: user.branch?.companyId || null,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        roles: [user.role],
        branchId: user.branchId,
        branchName: user.branch?.nameEn,
        companyId: user.branch?.companyId,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: dto.role || 'PASSENGER',
        branchId: dto.branchId || null,
        active: true,
      },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branch: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      branch: user.branch,
      company: user.branch?.company,
    };
  }
}
