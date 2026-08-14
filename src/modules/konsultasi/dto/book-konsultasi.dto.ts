import { IsNotEmpty, IsString } from 'class-validator';

export class BookKonsultasiDto {
  @IsNotEmpty()
  @IsString()
  dokterId!: string;

  @IsNotEmpty()
  @IsString()
  jadwalId!: string;
}