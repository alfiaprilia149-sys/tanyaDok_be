import { IsNotEmpty, IsString } from 'class-validator';

export class BayarDto {
  @IsNotEmpty({ message: 'Metode pembayaran wajib diisi' })
  @IsString()
  metode!: string; // contoh: "Transfer Bank", "QRIS", "E-Wallet" - bebas, cuma dicatat
}