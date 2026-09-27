import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class StartShiftDto {
  @IsNumber()
  @Min(0)
  openingCashETB!: number;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EndShiftDto {
  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsNumber()
  @Min(0)
  actualCashETB!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
