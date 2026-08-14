import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Pakai di atas controller/handler untuk membatasi akses berdasarkan role.
 * Contoh: @Roles(Role.ADMIN)
 * Harus dipasangkan dengan JwtAuthGuard + RolesGuard.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);