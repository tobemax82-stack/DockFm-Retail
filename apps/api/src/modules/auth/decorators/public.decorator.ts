import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator per marcare un endpoint come pubblico (no auth required)
 * 
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { return { status: 'ok' }; }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
