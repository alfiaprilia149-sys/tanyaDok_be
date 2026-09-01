import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDokterDto {
  @ApiProperty({ example: 'dr. Siti Aminah, Sp.PD', required: false })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty({ example: '081298765432', required: false })
  @IsOptional()
  @IsString()
  noHp?: string;

  @ApiProperty({ example: 'Spesialis Penyakit Dalam', required: false })
  @IsOptional()
  @IsString()
  spesialisasi?: string;

  @ApiProperty({ example: 'SIP-123456789', required: false })
  @IsOptional()
  @IsString()
  noSip?: string;

  @ApiProperty({ example: 75000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  tarifKonsultasi?: number;

  @ApiProperty({ example: true, required: false, description: 'false = nonaktifkan dokter (soft delete)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}