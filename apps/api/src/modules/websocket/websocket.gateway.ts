import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    type: 'player' | 'dashboard';
    storeId?: string;
    organizationId?: string;
    userId?: string;
    deviceId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebsocketGateway');

  constructor(
    private jwtService: JwtService,
    private websocketService: WebsocketService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway inizializzato');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Autenticazione via query params o headers
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      const deviceId = client.handshake.auth?.deviceId || client.handshake.query?.deviceId;
      const storeId = client.handshake.auth?.storeId || client.handshake.query?.storeId;

      if (deviceId && storeId) {
        // È un player
        client.user = {
          type: 'player',
          storeId: storeId as string,
          deviceId: deviceId as string,
        };
        
        // Unisciti alla room dello store
        client.join(`store:${storeId}`);
        
        // Aggiorna stato online
        await this.websocketService.updateStoreHeartbeat(storeId as string);
        
        this.logger.log(`Player connesso: store=${storeId}`);
      } else if (token) {
        // È un dashboard
        try {
          const payload = this.jwtService.verify(token as string);
          client.user = {
            type: 'dashboard',
            userId: payload.sub,
            organizationId: payload.organizationId,
          };

          // Unisciti alla room dell'organizzazione
          client.join(`org:${payload.organizationId}`);
          
          this.logger.log(`Dashboard connesso: user=${payload.sub}, org=${payload.organizationId}`);
        } catch {
          this.logger.warn(`Token non valido, connessione rifiutata`);
          client.disconnect();
          return;
        }
      } else {
        this.logger.warn(`Connessione senza autenticazione rifiutata`);
        client.disconnect();
        return;
      }

      // Registra il client
      this.websocketService.registerClient(client.id, {
        type: client.user.type,
        storeId: client.user.storeId,
        organizationId: client.user.organizationId,
        userId: client.user.userId,
      });

    } catch (error) {
      this.logger.error(`Errore connessione: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.logger.log(`Client disconnesso: ${client.user.type} ${client.id}`);
      
      // Se è un player, segna lo store offline
      if (client.user.type === 'player' && client.user.storeId) {
        await this.websocketService.markStoreOffline(client.user.storeId);
        
        // Notifica i dashboard
        this.server
          .to(`org:${client.user.organizationId}`)
          .emit('store:offline', { storeId: client.user.storeId });
      }

      this.websocketService.removeClient(client.id);
    }
  }

  // ===== EVENTI DAL PLAYER =====

  @SubscribeMessage('player:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { volume?: number; isPlaying?: boolean; currentTrackId?: string },
  ) {
    if (client.user?.storeId) {
      await this.websocketService.updateStoreHeartbeat(client.user.storeId);
      
      // Notifica i dashboard dello stato
      this.server
        .to(`org:${client.user.organizationId}`)
        .emit('store:status', {
          storeId: client.user.storeId,
          ...data,
          timestamp: new Date().toISOString(),
        });
    }
  }

  @SubscribeMessage('player:track-started')
  handleTrackStarted(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { trackId: string; title: string },
  ) {
    if (client.user?.storeId) {
      this.server
        .to(`org:${client.user.organizationId}`)
        .emit('store:track-playing', {
          storeId: client.user.storeId,
          ...data,
        });
    }
  }

  @SubscribeMessage('player:announcement-played')
  handleAnnouncementPlayed(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { announcementId: string; name: string },
  ) {
    if (client.user?.storeId) {
      this.server
        .to(`org:${client.user.organizationId}`)
        .emit('store:announcement-played', {
          storeId: client.user.storeId,
          ...data,
        });
    }
  }

  // ===== COMANDI DAL DASHBOARD =====

  @SubscribeMessage('command:play')
  handlePlayCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:play');
    this.logger.log(`Comando PLAY inviato a store ${data.storeId}`);
  }

  @SubscribeMessage('command:stop')
  handleStopCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:stop');
    this.logger.log(`Comando STOP inviato a store ${data.storeId}`);
  }

  @SubscribeMessage('command:volume')
  handleVolumeCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string; volume: number },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:volume', { volume: data.volume });
    this.logger.log(`Comando VOLUME (${data.volume}) inviato a store ${data.storeId}`);
  }

  @SubscribeMessage('command:next')
  handleNextCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:next');
  }

  @SubscribeMessage('command:playlist')
  handlePlaylistCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string; playlistId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:playlist', { playlistId: data.playlistId });
    this.logger.log(`Cambio playlist (${data.playlistId}) inviato a store ${data.storeId}`);
  }

  @SubscribeMessage('command:announcement')
  handleAnnouncementCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string; announcementId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:announcement', { announcementId: data.announcementId });
    this.logger.log(`Riproduci annuncio (${data.announcementId}) inviato a store ${data.storeId}`);
  }

  @SubscribeMessage('command:reload')
  handleReloadCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storeId: string },
  ) {
    this.server.to(`store:${data.storeId}`).emit('command:reload');
    this.logger.log(`Comando RELOAD inviato a store ${data.storeId}`);
  }

  // ===== BROADCAST HELPERS =====

  /**
   * Invia un messaggio a tutti i player di un'organizzazione
   */
  broadcastToOrganization(organizationId: string, event: string, data: any) {
    this.server.to(`org:${organizationId}`).emit(event, data);
  }

  /**
   * Invia un messaggio a un singolo store
   */
  sendToStore(storeId: string, event: string, data: any) {
    this.server.to(`store:${storeId}`).emit(event, data);
  }

  /**
   * Notifica aggiornamento contenuti
   */
  notifyContentUpdate(organizationId: string, type: 'playlist' | 'announcement' | 'schedule') {
    this.broadcastToOrganization(organizationId, 'content:updated', { type });
  }
}
