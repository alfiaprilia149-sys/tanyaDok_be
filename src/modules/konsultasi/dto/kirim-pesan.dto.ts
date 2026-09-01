import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipePesan } from '@prisma/client';

export class KirimPesanDto {
  @ApiProperty({ example: 'Halo dok, saya mau konsultasi soal demam anak saya' })
  @IsNotEmpty({ message: 'Isi pesan tidak boleh kosong' })
  @IsString()
  isiPesan!: string;

  @ApiProperty({ enum: TipePesan, example: TipePesan.TEXT, required: false })
  @IsOptional()
  @IsEnum(TipePesan)
  tipe?: TipePesan;
}