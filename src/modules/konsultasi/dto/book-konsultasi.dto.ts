import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BookKonsultasiDto {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9', description: 'id dari GET /dokter' })
  @IsNotEmpty()
  @IsString()
  dokterId!: string;

  @ApiProperty({ example: 'clx9z8y7x6w5v4u3t2s1', description: 'id dari GET /konsultasi/jadwal-tersedia' })
  @IsNotEmpty()
  @IsString()
  jadwalId!: string;
}