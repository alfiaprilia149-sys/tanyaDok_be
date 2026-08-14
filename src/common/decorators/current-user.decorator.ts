import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Ambil user yang sedang login (hasil validasi JwtStrategy) di handler manapun.
 * Contoh: getMe(@CurrentUser() user: JwtUser)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);