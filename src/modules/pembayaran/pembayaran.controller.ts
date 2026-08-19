import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BayarDto } from './dto/bayar.dto';
import { PembayaranService } from './pembayaran.service';

@ApiTags('pembayaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('pembayaran')
export class PembayaranController {
  constructor(private pembayaranService: PembayaranService) {}

  @Get('saya')
  @ApiOperation({
    summary: 'Riwayat pembayaran sendiri',
    description: 'Semua tagihan Pembayaran milik customer yang login (dari sesi konsultasi yang sudah SELESAI), apapun statusnya.',
  })
  findMyPembayaran(@CurrentUser() user: JwtUser) {
    return this.pembayaranService.findMyPembayaran(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail satu tagihan pembayaran',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pembayaranService.findOne(id, user.userId);
  }

  @Patch(':id/bayar')
  @ApiOperation({
    summary: 'Simulasi bayar tagihan',
    description:
      'Status langsung berubah PENDING -> BERHASIL begitu endpoint ini dipanggil, tanpa verifikasi apapun. ' +
      'Body cuma butuh field metode (bebas, contoh: "Transfer Bank", "QRIS") sekadar dicatat.',
  })
  bayar(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: BayarDto,
  ) {
    return this.pembayaranService.bayar(id, user.userId, dto);
  }
}