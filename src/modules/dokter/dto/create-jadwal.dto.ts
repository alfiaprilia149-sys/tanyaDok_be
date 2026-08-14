import { IsDateString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // format HH:mm, 24 jam

export class CreateJadwalDto {
  @IsDateString({}, { message: 'Format tanggal harus YYYY-MM-DD' })
  tanggal!: string;

  @Matches(TIME_REGEX, { message: 'Format jamMulai harus HH:mm, contoh: 09:00' })
  jamMulai!: string;

  @Matches(TIME_REGEX, { message: 'Format jamSelesai harus HH:mm, contoh: 12:00' })
  jamSelesai!: string;
}