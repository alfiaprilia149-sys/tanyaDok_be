import { Module } from '@nestjs/common';
import { DokterController } from './dokter.controller';
import { DokterService } from './dokter.service';
import { JadwalController } from './jadwal/jadwal.controller';
import { JadwalService } from './jadwal/jadwal.service';

@Module({
  controllers: [DokterController, JadwalController],
  providers: [DokterService, JadwalService],
  exports: [DokterService, JadwalService],
})
export class DokterModule {}