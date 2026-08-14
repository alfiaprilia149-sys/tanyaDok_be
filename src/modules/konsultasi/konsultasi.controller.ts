import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, StatusSesiKonsultasi } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BookKonsultasiDto } from './dto/book-konsultasi.dto';
import { KirimPesanDto } from './dto/kirim-pesan.dto';
import { TolakKonsultasiDto } from './dto/tolak-konsultasi.dto';
import { KonsultasiService } from './konsultasi.service';

@ApiTags('konsultasi')
@Controller('konsultasi')
export class KonsultasiController {
  constructor(private konsultasiService: KonsultasiService) {}

  // --- Publik: customer lihat slot yang bisa dibooking ---
  @Get('jadwal-tersedia')
  findJadwalTersedia(
    @Query('dokterId') dokterId?: string,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.konsultasiService.findJadwalTersedia(dokterId, tanggal);
  }

  // --- Customer ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  book(@CurrentUser() user: JwtUser, @Body() dto: BookKonsultasiDto) {
    return this.konsultasiService.book(user.userId, dto);
  }

  @Get('saya')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  findMySessions(@CurrentUser() user: JwtUser) {
    return this.konsultasiService.findMySessions(user.userId);
  }

  @Patch(':id/batalkan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  cancel(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.cancel(id, user.userId);
  }

  // --- Dokter ---
  @Get('pasien')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  findPasienDokter(
    @CurrentUser() user: JwtUser,
    @Query('status') status?: StatusSesiKonsultasi,
  ) {
    return this.konsultasiService.findPasienDokter(user.userId, status);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  approve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.approve(id, user.userId);
  }

  @Patch(':id/tolak')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  tolak(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: TolakKonsultasiDto,
  ) {
    return this.konsultasiService.tolak(id, user.userId, dto);
  }

  // --- Bersama (customer & dokter yang terlibat) ---
  @Patch(':id/selesai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  selesaikan(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.selesaikan(id, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.findOne(id, user);
  }

  // --- Chat (REST polling) ---
  @Post(':id/pesan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  kirimPesan(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: KirimPesanDto,
  ) {
    return this.konsultasiService.kirimPesan(id, user, dto);
  }

  @Get(':id/pesan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getPesan(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Query('sejakId') sejakId?: string,
  ) {
    return this.konsultasiService.getPesan(id, user, sejakId);
  }
}