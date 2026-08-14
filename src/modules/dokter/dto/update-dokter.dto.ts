import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDokterDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  noHp?: string;

  @IsOptional()
  @IsString()
  spesialisasi?: string;

  @IsOptional()
  @IsString()
  noSip?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tarifKonsultasi?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}