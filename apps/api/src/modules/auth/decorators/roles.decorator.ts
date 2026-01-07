import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator per specificare i ruoli richiesti per un endpoint
 * 
 * @example
 * @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 * @Get('admin-only')
 * adminOnlyEndpoint() { return { message: 'Admin area' }; }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
