import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDokterDto {
  // --- data akun (User) ---
  @ApiProperty({ example: 'dr. Siti Aminah' })
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  nama!: string;

  @ApiProperty({ example: 'siti.aminah@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'rahasia123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @ApiProperty({ example: '081298765432', required: false })
  @IsOptional()
  @IsString()
  noHp?: string;

  // --- data profil (Dokter) ---
  @ApiProperty({ example: 'Dokter Umum' })
  @IsNotEmpty({ message: 'Spesialisasi wajib diisi' })
  @IsString()
  spesialisasi!: string;

  @ApiProperty({ example: 'SIP-123456789', required: false })
  @IsOptional()
  @IsString()
  noSip?: string;

  @ApiProperty({ example: 50000, description: 'Tarif konsultasi dalam Rupiah' })
  @IsInt()
  @Min(0)
  tarifKonsultasi!: number;
}