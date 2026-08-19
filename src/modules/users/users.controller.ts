import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Profil lengkap user yang sedang login',
    description: 'Beda dari GET /auth/me — endpoint ini ambil data lengkap langsung dari database (nama, noHp, alamat, foto, dll), bukan cuma isi token.',
  })
  getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.findById(user.userId);
  }
}