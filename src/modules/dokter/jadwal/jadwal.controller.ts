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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  create(
    @Param('dokterId') dokterId: string,
    @Body() dto: CreateJadwalDto,
  ) {
    return this.jadwalService.create(dokterId, dto);
  }

  @Get('dokter/:dokterId/jadwal')
  findAllByDokter(@Param('dokterId') dokterId: string) {
    return this.jadwalService.findAllByDokter(dokterId);
  }

  @Patch('jadwal/:id')
  update(@Param('id') id: string, @Body() dto: UpdateJadwalDto) {
    return this.jadwalService.update(id, dto);
  }

  @Delete('jadwal/:id')
  remove(@Param('id') id: string) {
    return this.jadwalService.remove(id);
  }
}