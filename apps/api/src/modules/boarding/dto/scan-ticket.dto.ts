import { IsOptional, IsString } from 'class-validator';

export class ScanTicketDto {
  @IsString()
  qrPayload!: string; // qrHash or raw QR text or ticketNumber

  @IsOptional()
  @IsString()
  currentTripId?: string;

  @IsOptional()
  @IsString()
  conductorId?: string;

  @IsOptional()
  @IsString()
  terminalLocation?: string;
}
