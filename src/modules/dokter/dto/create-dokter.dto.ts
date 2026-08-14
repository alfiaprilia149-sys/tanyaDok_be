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
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  nama!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsOptional()
  @IsString()
  noHp?: string;

  // --- data profil (Dokter) ---
  @IsNotEmpty({ message: 'Spesialisasi wajib diisi' })
  @IsString()
  spesialisasi!: string;

  @IsOptional()
  @IsString()
  noSip?: string;

  @IsInt()
  @Min(0)
  tarifKonsultasi!: number;
}