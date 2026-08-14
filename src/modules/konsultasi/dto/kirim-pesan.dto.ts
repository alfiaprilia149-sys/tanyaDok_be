import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipePesan } from '@prisma/client';

export class KirimPesanDto {
  @IsNotEmpty({ message: 'Isi pesan tidak boleh kosong' })
  @IsString()
  isiPesan!: string;

  @IsOptional()
  @IsEnum(TipePesan)
  tipe?: TipePesan;
}