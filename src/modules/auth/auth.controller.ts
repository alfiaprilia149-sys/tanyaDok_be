import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Daftar akun customer baru',
    description:
      'Registrasi publik. Akun yang dibuat lewat endpoint ini selalu berrole CUSTOMER, tidak bisa dipilih. ' +
      'Akun DOKTER dibuat oleh admin lewat POST /dokter, dan akun ADMIN hanya dibuat sekali lewat seed database.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Berlaku untuk semua role (ADMIN, DOKTER, CUSTOMER) dengan email & password yang sama. ' +
      'Response berisi accessToken (JWT) yang dipakai di header Authorization: Bearer <token> untuk endpoint yang butuh login.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Data user yang sedang login',
    description: 'Ambil id, email, dan role dari token JWT yang sedang dipakai. Berguna untuk cek token masih valid & tahu role user saat ini.',
  })
  me(@CurrentUser() user: JwtUser) {
    return user;
  }
}