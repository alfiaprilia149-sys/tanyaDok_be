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
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateJadwalDto } from '../dto/create-jadwal.dto';
import { UpdateJadwalDto } from '../dto/update-jadwal.dto';
import { JadwalService } from './jadwal.service';

@ApiTags('jadwal-dokter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller()
export class JadwalController {
  constructor(private jadwalService: JadwalService) {}

  @Post('dokter/:dokterId/jadwal')
  @ApiOperation({
    summary: '[ADMIN] Tambah slot jadwal untuk dokter',
    description:
      'tanggal format YYYY-MM-DD, jamMulai/jamSelesai format HH:mm. Slot ini yang nanti muncul di GET /konsultasi/jadwal-tersedia untuk dibooking customer.',
  })
  create(
    @Param('dokterId') dokterId: string,
    @Body() dto: CreateJadwalDto,
  ) {
    return this.jadwalService.create(dokterId, dto);
  }

  @Get('dokter/:dokterId/jadwal')
  @ApiOperation({
    summary: '[ADMIN] List semua jadwal milik satu dokter',
    description: 'Menampilkan semua slot jadwal dokter ini (termasuk yang sudah lewat), diurutkan dari tanggal terdekat.',
  })
  findAllByDokter(@Param('dokterId') dokterId: string) {
    return this.jadwalService.findAllByDokter(dokterId);
  }

  @Patch('jadwal/:id')
  @ApiOperation({
    summary: '[ADMIN] Edit slot jadwal',
    description: 'Semua field opsional, kirim cuma yang mau diubah.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateJadwalDto) {
    return this.jadwalService.update(id, dto);
  }

  @Delete('jadwal/:id')
  @ApiOperation({
    summary: '[ADMIN] Hapus slot jadwal',
    description: 'Akan ditolak (409) kalau slot ini sudah ada customer yang booking, supaya data booking gak jadi anak yatim.',
  })
  remove(@Param('id') id: string) {
    return this.jadwalService.remove(id);
  }
}