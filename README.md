# 🎵 DockFm Retail

> La piattaforma instore più moderna, automatizzata e centralizzata del mercato.

**Semplice per i negozi, potentissima per le catene. Con AI integrata in ogni parte del flusso.**

![DockFm Retail](https://via.placeholder.com/1200x600/020617/6366f1?text=DockFm+Retail)

## ✨ Caratteristiche

### 🏪 Per il Negozio
- **Interfaccia semplicissima**: Play, Stop, Volume
- **Cartwall**: 4-6 annunci rapidi con shortcut tastiera
- **Modalità Kiosk**: Protezione schermo anti-manomissione
- **Funziona offline**: Cache locale per continuità garantita

### 🖥️ Per la Sede Centrale
- **Dashboard completa**: Controllo di tutti i negozi in tempo reale
- **Gestione playlist**: Per settore, mood, fascia oraria
- **Sistema annunci**: Scheduling avanzato con rotazioni
- **AI Studio**: Genera annunci, jingle e promo con un click
- **Reportistica**: Analytics dettagliate per ogni store

### 🧠 AI Integrata
- Generazione spot vocali automatici
- Playlist dinamiche basate sul mood
- News e meteo automatici
- Suggerimenti intelligenti

### 🔒 Affidabilità Enterprise
- Fallback offline automatico
- Watchdog per riavvio automatico
- Aggiornamenti centralizzati
- Logging completo

## 📦 Struttura Progetto

```
dockfm-retail/
├── apps/
│   ├── player/          # App Electron per i negozi
│   ├── dashboard/       # Dashboard web React
│   └── api/            # Backend NestJS
├── packages/
│   ├── ui/             # Design system condiviso
│   └── shared/         # Tipi e costanti condivise
└── docs/               # Documentazione
```

## 🚀 Quick Start

### Prerequisiti
- Node.js 20+
- pnpm 8+

### Installazione

```bash
# Clona il repository
git clone https://github.com/tobemax82-stack/DockFm-Retail.git
cd DockFm-Retail

# Installa le dipendenze
pnpm install

# Avvia in sviluppo
pnpm dev
```

### Comandi disponibili

```bash
# Sviluppo
pnpm dev                 # Avvia tutti i progetti
pnpm player:dev          # Solo player Electron
pnpm dashboard:dev       # Solo dashboard web
pnpm api:dev             # Solo backend API

# Build
pnpm build               # Build di produzione

# Database
pnpm db:migrate          # Esegui migrazioni
pnpm db:seed             # Popola dati demo
```

## 🎨 Design System

Il design utilizza:
- **Tailwind CSS** con tema personalizzato
- **Framer Motion** per animazioni fluide
- **Glassmorphism** e effetti moderni
- **Palette futuristica** blu/cyan

## 💰 Pricing

| Piano | Store | Prezzo |
|-------|-------|--------|
| **Solo** | 1 | €19/mese |
| **Chain** | 2-20 | €49/mese + €15/store |
| **Enterprise** | 21+ | Su misura |

## 📊 Roadmap

### Fase 1 - MVP (4-6 settimane)
- [x] Design system UI
- [x] Player Electron base
- [x] Dashboard web base
- [ ] Backend API
- [ ] Sistema autenticazione
- [ ] Gestione negozi base

### Fase 2 - Core Features (8-10 settimane)
- [ ] Multi-store completo
- [ ] Sistema annunci avanzato
- [ ] Scheduler programmazione
- [ ] Reportistica base
- [ ] Integrazione AI voci

### Fase 3 - Enterprise (12-16 settimane)
- [ ] AI music generation
- [ ] Branding personalizzato
- [ ] API pubbliche
- [ ] App mobile companion
- [ ] Raspberry Pi support

## 📄 Licenza

Proprietario - DockFm © 2024

## 🤝 Contatti

- Website: [dockfm.it](https://dockfm.it)
- Email: info@dockfm.it
