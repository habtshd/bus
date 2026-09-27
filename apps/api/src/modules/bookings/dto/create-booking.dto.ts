import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PassengerItemDto {
  @IsOptional()
  @IsString()
  seatId?: string; // busSeatId or physical seat id

  @IsOptional()
  @IsString()
  seatNumber?: string; // e.g. "12A"

  @IsOptional()
  @IsString()
  passengerName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  passengerPhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsString()
  passengerIdNumber?: string;
}

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  fromStopId?: string;

  @IsOptional()
  @IsString()
  toStopId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerItemDto)
  passengers!: PassengerItemDto[];

  @IsOptional()
  @IsString()
  paymentMethod?: string; // CASH | TELEBIRR | CBE_BIRR | AWASH_BIRR | CHAPA | CARD

  @IsOptional()
  @IsString()
  channel?: string; // PASSENGER_APP | WEBSITE | COUNTER | PHONE | TRAVEL_AGENT | EXTERNAL_OTA

  @IsOptional()
  @IsString()
  promoCode?: string;

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

