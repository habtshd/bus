import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RouteStopItemDto {
  @IsString()
  stopId!: string;

  @IsNumber()
  @Min(1)
  sequenceNumber!: number;

  @IsOptional()
  @IsNumber()
  distanceFromOriginKm?: number;

  @IsOptional()
  @IsNumber()
  estimatedMinutesFromOrigin?: number;
}

export class CreateRouteDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  routeCode!: string;

  @IsString()
  originStopId!: string;

  @IsString()
  destinationStopId!: string;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  intermediateStopIds?: string[];

  @IsOptional()
  @IsArray()
  routeStops?: RouteStopItemDto[];
}
