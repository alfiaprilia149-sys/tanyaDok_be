import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateDokterDto } from './dto/create-dokter.dto';
import { SetStatusOnlineDto } from './dto/set-status-online.dto';
import { UpdateDokterDto } from './dto/update-dokter.dto';
import { DokterService } from './dokter.service';

@ApiTags('dokter')
@Controller('dokter')
export class DokterController {
  constructor(private dokterService: DokterService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Bikin akun dokter baru',
    description:
      'Sekaligus bikin User (role DOKTER) + profil Dokter dalam satu transaksi. ' +
      'Dokter login pakai email/password yang diisi di sini lewat POST /auth/login biasa.',
  })
  create(@Body() dto: CreateDokterDto) {
    return this.dokterService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List semua dokter aktif',
    description: 'Publik, tidak perlu login. Cuma menampilkan dokter dengan isActive=true. Dipakai customer untuk pilih dokter sebelum booking.',
  })
  findAll() {
    return this.dokterService.findAll();
  }

  @Patch('me/status-online')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[DOKTER] Ubah status online sendiri',
    description: 'Dokter toggle status standby-nya sendiri (true = sedang siap menerima chat). Ini status real-time, beda dari jadwal harian.',
  })
  setStatusOnline(
    @CurrentUser() user: JwtUser,
    @Body() dto: SetStatusOnlineDto,
  ) {
    return this.dokterService.setStatusOnline(user.userId, dto.statusOnline);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail satu dokter',
    description: 'Publik, tidak perlu login.',
  })
  findOne(@Param('id') id: string) {
    return this.dokterService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Update data dokter',
    description: 'Semua field opsional, kirim cuma field yang mau diubah. Bisa juga dipakai untuk aktifkan/nonaktifkan dokter via field isActive.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateDokterDto) {
    return this.dokterService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Nonaktifkan dokter (soft delete)',
    description: 'Tidak menghapus data dari database — cuma set isActive=false, supaya riwayat konsultasi lama dokter ini tetap utuh.',
  })
  remove(@Param('id') id: string) {
    return this.dokterService.remove(id);
  }
}