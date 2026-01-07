import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Guard per verificare che l'utente abbia accesso alla risorsa
 * nel contesto della propria organizzazione (multi-tenant)
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utente non autenticato');
    }

    // Super Admin ha accesso a tutto
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Controlla se c'è un organizationId nei params o body
    const params = request.params;
    const body = request.body;
    const query = request.query;

    const targetOrgId = params.organizationId || body.organizationId || query.organizationId;

    // Se c'è un organizationId specificato, verifica che corrisponda
    if (targetOrgId && targetOrgId !== user.organizationId) {
      throw new ForbiddenException('Non hai accesso a questa organizzazione');
    }

    // Per le risorse annidate (es. store), verifica che appartengano all'organizzazione
    const storeId = params.storeId || body.storeId || query.storeId;
    if (storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { organizationId: true },
      });

      if (!store) {
        throw new ForbiddenException('Negozio non trovato');
      }

      if (store.organizationId !== user.organizationId) {
        throw new ForbiddenException('Non hai accesso a questo negozio');
      }
    }

    return true;
  }
}
