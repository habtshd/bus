import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  routeId!: string;

  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsString()
  busId!: string;

  @IsDateString()
  tripDate!: string;

  @IsDateString()
  scheduledDeparture!: string;

  @IsOptional()
  @IsDateString()
  scheduledArrival?: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
