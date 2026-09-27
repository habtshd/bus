import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStopDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  type?: 'TERMINAL' | 'BOARDING_POINT' | 'DROP_OFF_POINT' | 'INTERMEDIATE_STOP';
}
