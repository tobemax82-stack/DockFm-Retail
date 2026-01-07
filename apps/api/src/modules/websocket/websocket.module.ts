import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dockfm-retail-secret-key-change-in-production',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketGateway, WebsocketService],
})
export class WebsocketModule {}
