import { IsNotEmpty, IsString } from 'class-validator';

export class TolakKonsultasiDto {
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @IsString()
  alasanPenolakan!: string;
}