import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ConnectedClient {
  socketId: string;
  type: 'player' | 'dashboard';
  storeId?: string;
  organizationId?: string;
  userId?: string;
  connectedAt: Date;
}

@Injectable()
export class WebsocketService {
  private connectedClients: Map<string, ConnectedClient> = new Map();

  constructor(private prisma: PrismaService) {}

  /**
   * Registra un client connesso
   */
  registerClient(socketId: string, client: Omit<ConnectedClient, 'socketId' | 'connectedAt'>) {
    this.connectedClients.set(socketId, {
      socketId,
      ...client,
      connectedAt: new Date(),
    });
  }

  /**
   * Rimuovi un client disconnesso
   */
  removeClient(socketId: string) {
    this.connectedClients.delete(socketId);
  }

  /**
   * Ottieni client per storeId
   */
  getClientsByStore(storeId: string): ConnectedClient[] {
    return Array.from(this.connectedClients.values())
      .filter(client => client.storeId === storeId);
  }

  /**
   * Ottieni client per organizationId
   */
  getClientsByOrganization(organizationId: string): ConnectedClient[] {
    return Array.from(this.connectedClients.values())
      .filter(client => client.organizationId === organizationId);
  }

  /**
   * Ottieni tutti i player connessi per un'organizzazione
   */
  getConnectedPlayers(organizationId: string): ConnectedClient[] {
    return this.getClientsByOrganization(organizationId)
      .filter(client => client.type === 'player');
  }

  /**
   * Ottieni tutti i dashboard connessi per un'organizzazione
   */
  getConnectedDashboards(organizationId: string): ConnectedClient[] {
    return this.getClientsByOrganization(organizationId)
      .filter(client => client.type === 'dashboard');
  }

  /**
   * Verifica se uno store è online (ha un player connesso)
   */
  isStoreOnline(storeId: string): boolean {
    return this.getClientsByStore(storeId).some(c => c.type === 'player');
  }

  /**
   * Statistiche connessioni
   */
  getConnectionStats() {
    const clients = Array.from(this.connectedClients.values());
    
    return {
      total: clients.length,
      players: clients.filter(c => c.type === 'player').length,
      dashboards: clients.filter(c => c.type === 'dashboard').length,
    };
  }

  /**
   * Ottieni tutti gli store online
   */
  async getOnlineStores(organizationId: string) {
    const connectedPlayers = this.getConnectedPlayers(organizationId);
    const storeIds = connectedPlayers.map(p => p.storeId).filter(Boolean);

    if (storeIds.length === 0) return [];

    return this.prisma.store.findMany({
      where: {
        id: { in: storeIds as string[] },
        organizationId,
      },
      select: {
        id: true,
        name: true,
        city: true,
        currentVolume: true,
        lastSeen: true,
      },
    });
  }

  /**
   * Aggiorna ultimo heartbeat per uno store
   */
  async updateStoreHeartbeat(storeId: string) {
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });
  }

  /**
   * Segna store come offline
   */
  async markStoreOffline(storeId: string) {
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });
  }
}
