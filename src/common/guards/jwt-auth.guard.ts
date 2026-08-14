import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Trigger JwtStrategy ('jwt') yang didaftarkan di AuthModule.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}