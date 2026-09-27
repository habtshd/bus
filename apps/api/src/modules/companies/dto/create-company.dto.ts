import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  legalName!: string;

  @IsOptional()
  @IsString()
  legalNameAm?: string;

  @IsString()
  tradeName!: string;

  // Optional alias for tradeName from request
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  tinNumber!: string;

  @IsOptional()
  @IsString()
  commercialRegNo?: string;

  @IsOptional()
  @IsString()
  headquartersAddress?: string;

  @IsOptional()
  @IsString()
  headquartersPhone?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;
}
