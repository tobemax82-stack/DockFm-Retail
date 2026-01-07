import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator per ottenere l'utente corrente dalla request
 * 
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 * 
 * @Get('my-org')
 * getOrg(@CurrentUser('organizationId') orgId: string) {
 *   return { organizationId: orgId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se viene specificato un campo, ritorna solo quello
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
