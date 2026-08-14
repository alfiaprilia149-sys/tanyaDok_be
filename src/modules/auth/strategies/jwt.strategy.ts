import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Return value di sini otomatis di-attach ke request.user oleh Passport.
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, nama: true },
    });

    if (!user) {
      // Cek ulang ke DB (bukan cuma percaya isi token) supaya user yang sudah
      // dihapus/nonaktif tidak bisa lagi pakai token lama yang belum expired.
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return { userId: user.id, email: user.email, role: user.role, nama: user.nama };
  }
}