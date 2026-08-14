import { Module } from '@nestjs/common';
import { KonsultasiController } from './konsultasi.controller';
import { KonsultasiService } from './konsultasi.service';

@Module({
  controllers: [KonsultasiController],
  providers: [KonsultasiService],
  exports: [KonsultasiService],
})
export class KonsultasiModule {}