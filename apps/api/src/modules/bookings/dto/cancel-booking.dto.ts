import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  refundPercentage?: number; // e.g. 90 (10% fee)

  @IsOptional()
  @IsString()
  agentId?: string;
}

export class RescheduleBookingDto {
  @IsString()
  newTripId!: string;

  @IsString()
  oldSeatNumber!: string;

  @IsString()
  newSeatNumber!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}
