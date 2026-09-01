import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // format HH:mm, 24 jam

export class CreateJadwalDto {
  @ApiProperty({ example: '2026-08-20', description: 'Format YYYY-MM-DD' })
  @IsDateString({}, { message: 'Format tanggal harus YYYY-MM-DD' })
  tanggal!: string;

  @ApiProperty({ example: '09:00', description: 'Format HH:mm (24 jam)' })
  @Matches(TIME_REGEX, { message: 'Format jamMulai harus HH:mm, contoh: 09:00' })
  jamMulai!: string;

  @ApiProperty({ example: '12:00', description: 'Format HH:mm (24 jam)' })
  @Matches(TIME_REGEX, { message: 'Format jamSelesai harus HH:mm, contoh: 12:00' })
  jamSelesai!: string;
}