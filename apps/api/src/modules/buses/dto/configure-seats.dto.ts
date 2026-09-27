import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SeatItemDto {
  @IsString()
  seatNumber!: string;

  @IsNumber()
  row!: number;

  @IsNumber()
  column!: number;

  @IsString()
  columnLetter!: string;

  @IsOptional()
  @IsString()
  seatType?: string; // REGULAR | VIP | ACCESSIBLE

  @IsOptional()
  @IsBoolean()
  isWindow?: boolean;

  @IsOptional()
  @IsBoolean()
  isAisle?: boolean;

  @IsOptional()
  @IsBoolean()
  isBackRow?: boolean;
}

export class ConfigureSeatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatItemDto)
  seats!: SeatItemDto[];
}
