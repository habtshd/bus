import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBusTypeDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  name!: string;

  @IsString()
  manufacturer!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Min(10)
  capacity!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
