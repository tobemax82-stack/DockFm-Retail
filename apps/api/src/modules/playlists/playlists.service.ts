import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaylistDto, UpdatePlaylistDto, AddTrackDto, ReorderTracksDto } from './dto/playlists.dto';
import { Prisma, Mood, TrackSource } from '@prisma/client';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, page = 1, limit = 20, mood?: Mood) {
    const skip = (page - 1) * limit;

    const where: Prisma.PlaylistWhereInput = {
      organizationId,
      ...(mood && { mood }),
    };

    const [playlists, total] = await Promise.all([
      this.prisma.playlist.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          mood: true,
          isActive: true,
          coverUrl: true,
          _count: {
            select: { tracks: true },
          },
          tracks: {
            take: 5,
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              artist: true,
              duration: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.playlist.count({ where }),
    ]);

    return {
      data: playlists.map(p => ({
        ...p,
        trackCount: p._count.tracks,
        _count: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id, organizationId },
      include: {
        tracks: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { tracks: true },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist non trovata');
    }

    // Calcola la durata totale
    const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);

    return {
      ...playlist,
      trackCount: playlist._count.tracks,
      totalDuration,
      _count: undefined,
    };
  }

  async create(createPlaylistDto: CreatePlaylistDto, organizationId: string) {
    return this.prisma.playlist.create({
      data: {
        ...createPlaylistDto,
        organizationId,
      },
    });
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.playlist.update({
      where: { id },
      data: updatePlaylistDto,
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    // Verifica che non sia in uso da nessuno store
    const storesUsingPlaylist = await this.prisma.store.count({
      where: { activePlaylistId: id },
    });

    if (storesUsingPlaylist > 0) {
      throw new ConflictException(`Questa playlist è in uso da ${storesUsingPlaylist} negozio/i. Rimuovila prima di eliminarla.`);
    }

    // Elimina anche tutte le tracce associate
    await this.prisma.track.deleteMany({
      where: { playlistId: id },
    });

    return this.prisma.playlist.delete({
      where: { id },
    });
  }

  async addTrack(playlistId: string, trackDto: AddTrackDto, organizationId: string) {
    await this.findOne(playlistId, organizationId);

    // Trova l'ordine massimo attuale
    const maxOrder = await this.prisma.track.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrder?.order ?? -1) + 1;

    return this.prisma.track.create({
      data: {
        ...trackDto,
        playlistId,
        order: newOrder,
      },
    });
  }

  async removeTrack(playlistId: string, trackId: string, organizationId: string) {
    await this.findOne(playlistId, organizationId);

    const track = await this.prisma.track.findFirst({
      where: { id: trackId, playlistId },
    });

    if (!track) {
      throw new NotFoundException('Traccia non trovata');
    }

    await this.prisma.track.delete({
      where: { id: trackId },
    });

    // Riordina le tracce rimanenti
    await this.reorderAfterDelete(playlistId, track.order);

    return { message: 'Traccia rimossa' };
  }

  async reorderTracks(playlistId: string, reorderDto: ReorderTracksDto, organizationId: string) {
    await this.findOne(playlistId, organizationId);

    // Aggiorna l'ordine di ogni traccia
    const updates = reorderDto.trackIds.map((trackId, index) => 
      this.prisma.track.updateMany({
        where: { id: trackId, playlistId },
        data: { order: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findOne(playlistId, organizationId);
  }

  async updateTrack(playlistId: string, trackId: string, updateData: Partial<AddTrackDto>, organizationId: string) {
    await this.findOne(playlistId, organizationId);

    const track = await this.prisma.track.findFirst({
      where: { id: trackId, playlistId },
    });

    if (!track) {
      throw new NotFoundException('Traccia non trovata');
    }

    return this.prisma.track.update({
      where: { id: trackId },
      data: updateData,
    });
  }

  async duplicate(id: string, organizationId: string, newName?: string) {
    const originalPlaylist = await this.findOne(id, organizationId);

    // Crea la nuova playlist
    const newPlaylist = await this.prisma.playlist.create({
      data: {
        name: newName || `${originalPlaylist.name} (copia)`,
        description: originalPlaylist.description,
        mood: originalPlaylist.mood,
        coverUrl: originalPlaylist.coverUrl,
        organizationId,
      },
    });

    // Copia tutte le tracce
    const tracksData = originalPlaylist.tracks.map(track => ({
      title: track.title,
      artist: track.artist,
      album: track.album,
      genre: track.genre,
      duration: track.duration,
      fileUrl: track.fileUrl,
      source: track.source,
      order: track.order,
      playlistId: newPlaylist.id,
    }));

    if (tracksData.length > 0) {
      await this.prisma.track.createMany({
        data: tracksData,
      });
    }

    return this.findOne(newPlaylist.id, organizationId);
  }

  async getByMood(organizationId: string, mood: Mood) {
    return this.prisma.playlist.findMany({
      where: { organizationId, mood, isActive: true },
      include: {
        _count: { select: { tracks: true } },
      },
    });
  }

  private async reorderAfterDelete(playlistId: string, deletedOrder: number) {
    await this.prisma.track.updateMany({
      where: {
        playlistId,
        order: { gt: deletedOrder },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  }
}
