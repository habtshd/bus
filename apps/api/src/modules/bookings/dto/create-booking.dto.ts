import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PassengerItemDto {
  @IsString()
  seatId!: string; // busSeatId or seatNumber

  @IsString()
  seatNumber!: string;

  @IsString()
  passengerName!: string;

  @IsString()
  passengerPhone!: string;

  @IsOptional()
  @IsString()
  passengerIdNumber?: string;
}

export class CreateBookingDto {
  @IsString()
  tripId!: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsString()
  fromStopId!: string;

  @IsString()
  toStopId!: string;

  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerItemDto)
  passengers!: PassengerItemDto[];

  @IsString()
  paymentMethod!: string; // CASH | TELEBIRR | CBE_BIRR | AWASH_BIRR | CHAPA_GATEWAY

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cashTenderedETB?: number;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}
