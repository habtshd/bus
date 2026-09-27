import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  nameEn!: string;

  // Optional alias for nameEn from request
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAm?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  terminalArea?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
