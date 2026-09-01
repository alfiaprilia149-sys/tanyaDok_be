import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Endpoint publik /auth/register hanya untuk daftar sebagai CUSTOMER.
// Akun ADMIN dibuat sekali lewat prisma/seed.ts.
// Akun DOKTER dibuat admin lewat POST /dokter (bukan self-register).
export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  nama!: string;

  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'rahasia123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @ApiProperty({ example: '081234567890', required: false })
  @IsOptional()
  @IsString()
  noHp?: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 10, Malang', required: false })
  @IsOptional()
  @IsString()
  alamat?: string;
}