import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  findMyPembayaran(@CurrentUser() user: JwtUser) {
    return this.pembayaranService.findMyPembayaran(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pembayaranService.findOne(id, user.userId);
  }

  @Patch(':id/bayar')
  bayar(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: BayarDto,
  ) {
    return this.pembayaranService.bayar(id, user.userId, dto);
  }
}