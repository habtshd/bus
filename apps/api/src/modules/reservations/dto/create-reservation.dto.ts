import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  tripId!: string;

  @IsString()
  fromStopId!: string;

  @IsString()
  toStopId!: string;

  @IsArray()
  @IsString({ each: true })
  seatIds!: string[];

  @IsOptional()
  @IsString()
  passengerId?: string;
}
