import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TolakKonsultasiDto {
  @ApiProperty({ example: 'Slot jadwal ini penuh, silakan pilih jam lain' })
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @IsString()
  alasanPenolakan!: string;
}