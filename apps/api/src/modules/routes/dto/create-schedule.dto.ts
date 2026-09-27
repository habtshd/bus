import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  routeId!: string;

  @IsOptional()
  @IsString()
  busTypeId?: string;

  @IsString()
  departureTime!: string; // e.g. "05:00"

  @IsArray()
  daysOfWeek!: string[]; // e.g. ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  @IsNumber()
  @Min(0)
  defaultPrice!: number;
}
