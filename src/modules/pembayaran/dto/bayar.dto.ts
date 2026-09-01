import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BayarDto {
  @ApiProperty({ example: 'Transfer Bank', description: 'Bebas diisi, contoh: Transfer Bank, QRIS, E-Wallet' })
  @IsNotEmpty({ message: 'Metode pembayaran wajib diisi' })
  @IsString()
  metode!: string;
}