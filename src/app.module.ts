import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DokterModule } from './modules/dokter/dokter.module';
import { KonsultasiModule } from './modules/konsultasi/konsultasi.module';
import { PembayaranModule } from './modules/pembayaran/pembayaran.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DokterModule,
    KonsultasiModule,
    PembayaranModule,
  ],
})
export class AppModule {}