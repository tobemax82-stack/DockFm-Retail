# DockFm Retail - Backend API

Backend API NestJS per DockFm Retail - La piattaforma instore audio più moderna.

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- PostgreSQL 14+
- pnpm (o npm/yarn)

### Setup

1. **Copia le variabili d'ambiente**
   ```bash
   cp .env.example .env
   ```

2. **Configura il database** in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dockfm_retail"
   ```

3. **Installa le dipendenze**
   ```bash
   pnpm install
   ```

4. **Esegui le migrazioni**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Avvia il server**
   ```bash
   pnpm dev
   ```

L'API sarà disponibile su `http://localhost:4000`
La documentazione Swagger su `http://localhost:4000/docs`

## 📁 Struttura

```
apps/api/
├── prisma/
│   └── schema.prisma      # Schema database
├── src/
│   ├── main.ts            # Bootstrap
│   ├── app.module.ts      # Root module
│   ├── prisma/            # Prisma service
│   └── modules/
│       ├── auth/          # Autenticazione JWT
│       ├── users/         # Gestione utenti
│       ├── organizations/ # Multi-tenant
│       ├── stores/        # Negozi/Player
│       ├── playlists/     # Playlist e tracce
│       ├── announcements/ # Annunci e cartwall
│       ├── scheduler/     # Programmazione oraria
│       ├── ai/            # Generazione AI (TTS, musica)
│       ├── analytics/     # Statistiche e log
│       ├── player/        # API per player Electron
│       └── websocket/     # Real-time communication
```

## 🔐 Autenticazione

L'API usa JWT per l'autenticazione. 

### Endpoint Auth

- `POST /auth/register` - Registrazione nuovo utente
- `POST /auth/login` - Login
- `POST /auth/refresh` - Rinnovo token
- `POST /auth/logout` - Logout

### Header

```
Authorization: Bearer <access_token>
```

### Ruoli Utente

- `SUPER_ADMIN` - Accesso completo a tutte le organizzazioni
- `ADMIN` - Gestione completa della propria organizzazione
- `STORE_MANAGER` - Gestione dei negozi assegnati
- `VIEWER` - Solo lettura

## 🎵 API Player

Il player Electron comunica con il backend via:

### REST API
- `GET /player/:storeId/state` - Stato completo
- `POST /player/heartbeat` - Mantieni online
- `POST /player/:storeId/track/start` - Log riproduzione

### WebSocket
Connessione a `ws://localhost:4000/ws` con:

```javascript
// Autenticazione Player
socket.auth = { deviceId: 'device_xxx', storeId: 'store_xxx' }

// Eventi dal player
socket.emit('player:heartbeat', { volume, isPlaying, currentTrackId })
socket.emit('player:track-started', { trackId, title })

// Comandi dal dashboard
socket.on('command:play', () => { /* play */ })
socket.on('command:stop', () => { /* stop */ })
socket.on('command:volume', ({ volume }) => { /* set volume */ })
```

## 🤖 AI Integration

### Text-to-Speech (ElevenLabs)
```bash
POST /ai/announcement
{
  "text": "Benvenuti nel nostro negozio!",
  "voiceId": "rachel",
  "improveText": true
}
```

### Generazione Musica (Mubert/Suno)
```bash
POST /ai/music
{
  "prompt": "Musica ambient rilassante per negozio",
  "mood": "RELAXED",
  "duration": 180
}
```

## 📊 Analytics

- Dashboard overview: `GET /analytics/dashboard`
- Stats per store: `GET /analytics/store/:storeId`
- Top tracks: `GET /analytics/store/:storeId/top-tracks`
- Trend: `GET /analytics/trend?period=week`

## 🔧 Script Disponibili

```bash
# Development
pnpm dev              # Avvia in watch mode
pnpm build            # Build produzione
pnpm start            # Avvia build

# Database
pnpm prisma migrate dev    # Applica migrazioni
pnpm prisma generate       # Genera client
pnpm prisma studio         # UI database
pnpm prisma db seed        # Seed dati demo

# Test
pnpm test             # Unit test
pnpm test:e2e         # E2E test
pnpm test:cov         # Coverage

# Lint
pnpm lint             # ESLint
pnpm format           # Prettier
```

## 🐳 Docker

```dockerfile
# docker-compose.yml
services:
  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/dockfm
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=dockfm
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## 📝 License

Proprietario - DockFm Retail
