import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBusDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  busTypeId?: string;

  @IsOptional()
  @IsString()
  fleetNumber?: string;

  @IsString()
  plateNumber!: string;

  @IsOptional()
  @IsString()
  sideNumber?: string;

  @IsOptional()
  @IsString()
  busModel?: string;

  @IsOptional()
  @IsString()
  busType?: string; // LUXURY_2X2 | STANDARD_2X3

  @IsOptional()
  @IsNumber()
  totalSeats?: number;

  @IsOptional()
  @IsString()
  currentBranchId?: string;

  @IsOptional()
  @IsBoolean()
  autoGenerateSeats?: boolean;
}
