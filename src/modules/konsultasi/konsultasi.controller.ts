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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Get('jadwal-tersedia')
  @ApiOperation({
    summary: 'List slot jadwal yang bisa dibooking',
    description:
      'Publik, tidak perlu login. Filter opsional: ?dokterId=&tanggal=YYYY-MM-DD. Tanpa filter tanggal, cuma nampilin jadwal hari ini dan ke depan (yang sudah lewat disembunyikan).',
  })
  findJadwalTersedia(
    @Query('dokterId') dokterId?: string,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.konsultasiService.findJadwalTersedia(dokterId, tanggal);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[CUSTOMER] Booking sesi konsultasi',
    description: 'Pilih dokterId + jadwalId dari hasil GET jadwal-tersedia. Status awal MENUNGGU_PERSETUJUAN, menunggu dokter approve.',
  })
  book(@CurrentUser() user: JwtUser, @Body() dto: BookKonsultasiDto) {
    return this.konsultasiService.book(user.userId, dto);
  }

  @Get('saya')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[CUSTOMER] Riwayat konsultasi sendiri',
    description: 'Semua sesi konsultasi milik customer yang login, apapun statusnya, diurutkan dari yang terbaru.',
  })
  findMySessions(@CurrentUser() user: JwtUser) {
    return this.konsultasiService.findMySessions(user.userId);
  }

  @Patch(':id/batalkan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[CUSTOMER] Batalkan booking',
    description: 'Cuma bisa dipakai kalau status masih MENUNGGU_PERSETUJUAN (belum di-approve/tolak dokter).',
  })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.cancel(id, user.userId);
  }

  @Get('pasien')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[DOKTER] "Jadwal pasien" - daftar sesi masuk',
    description: 'Semua sesi konsultasi yang mengarah ke dokter ini. Filter opsional ?status=MENUNGGU_PERSETUJUAN|DISETUJUI|DITOLAK|SELESAI|DIBATALKAN.',
  })
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
  @ApiOperation({
    summary: '[DOKTER] Approve booking customer',
    description: 'Status berubah MENUNGGU_PERSETUJUAN -> DISETUJUI. Chat langsung bisa dipakai setelah ini.',
  })
  approve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.approve(id, user.userId);
  }

  @Patch(':id/tolak')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[DOKTER] Tolak booking customer',
    description: 'Wajib isi alasanPenolakan di body. Status berubah jadi DITOLAK, tidak bisa diproses lagi.',
  })
  tolak(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: TolakKonsultasiDto,
  ) {
    return this.konsultasiService.tolak(id, user.userId, dto);
  }

  @Patch(':id/selesai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Selesaikan sesi konsultasi',
    description:
      'Bisa dipanggil oleh customer ATAU dokter yang terlibat di sesi ini. Cuma bisa dipakai saat status DISETUJUI. ' +
      'Otomatis bikin record Pembayaran baru (status PENDING) untuk ditagih ke customer.',
  })
  selesaikan(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.selesaikan(id, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Detail satu sesi konsultasi',
    description: 'Cuma bisa diakses oleh customer atau dokter yang terlibat di sesi ini (403 kalau bukan).',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.konsultasiService.findOne(id, user);
  }

  @Post(':id/pesan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kirim pesan chat',
    description: 'Cuma bisa dipakai selama status sesi DISETUJUI. Pengirim otomatis diambil dari token (customer atau dokter yang terlibat).',
  })
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
  @ApiOperation({
    summary: 'Ambil pesan chat (polling)',
    description:
      'Frontend polling endpoint ini berkala untuk update chat real-time. Pakai query ?sejakId=<idPesanTerakhir> supaya cuma ambil pesan baru, ' +
      'bukan re-fetch semua history tiap kali polling.',
  })
  getPesan(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Query('sejakId') sejakId?: string,
  ) {
    return this.konsultasiService.getPesan(id, user, sejakId);
  }
}