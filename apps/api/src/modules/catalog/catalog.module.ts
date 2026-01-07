// =====================================================
// DOCKFM RETAIL - CATALOG MODULE
// Music Catalog & External Providers
// =====================================================

import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { MusicCatalogService } from './catalog.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [MusicCatalogService],
  exports: [MusicCatalogService],
})
export class CatalogModule {}
