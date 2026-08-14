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
  create(@Body() dto: CreateDokterDto) {
    return this.dokterService.create(dto);
  }

  // Publik: dipakai customer untuk lihat daftar dokter (nanti dipakai juga di modul konsultasi)
  @Get()
  findAll() {
    return this.dokterService.findAll();
  }

  // Statis, harus di atas ':id' supaya tidak ketangkap sebagai param id
  @Patch('me/status-online')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOKTER)
  @ApiBearerAuth()
  setStatusOnline(
    @CurrentUser() user: JwtUser,
    @Body() dto: SetStatusOnlineDto,
  ) {
    return this.dokterService.setStatusOnline(user.userId, dto.statusOnline);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dokterService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateDokterDto) {
    return this.dokterService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.dokterService.remove(id);
  }
}