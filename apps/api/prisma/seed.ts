// Seed script per popolare il database con dati demo
import { PrismaClient, UserRole, Plan, BusinessSector, Mood, AnnouncementType, TrackSource, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crea Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@dockfm.com' },
    update: {},
    create: {
      email: 'admin@dockfm.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Super Admin creato:', superAdmin.email);

  // 2. Crea Organizzazione Demo
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'fashion-store-demo' },
    update: {},
    create: {
      name: 'Fashion Store Demo',
      slug: 'fashion-store-demo',
      plan: Plan.PROFESSIONAL,
      sector: BusinessSector.FASHION,
      isActive: true,
      settings: {
        defaultVolume: 70,
        defaultMood: Mood.UPBEAT,
        autoPlay: true,
      },
    },
  });
  console.log('✅ Organizzazione creata:', demoOrg.name);

  // 3. Crea Admin per l'organizzazione
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'admin@fashionstore.demo' },
    update: {},
    create: {
      email: 'admin@fashionstore.demo',
      password: adminPassword,
      firstName: 'Mario',
      lastName: 'Rossi',
      role: UserRole.ADMIN,
      isActive: true,
      organizationId: demoOrg.id,
    },
  });
  console.log('✅ Admin organizzazione creato:', orgAdmin.email);

  // 4. Crea alcuni Store Manager
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager.milano@fashionstore.demo' },
    update: {},
    create: {
      email: 'manager.milano@fashionstore.demo',
      password: managerPassword,
      firstName: 'Giuseppe',
      lastName: 'Verdi',
      role: UserRole.STORE_MANAGER,
      isActive: true,
      organizationId: demoOrg.id,
    },
  });

  // 5. Crea alcuni negozi
  const store1 = await prisma.store.upsert({
    where: { id: 'store_milano_centro' },
    update: {},
    create: {
      id: 'store_milano_centro',
      name: 'Milano Centro',
      address: 'Via Montenapoleone 1',
      city: 'Milano',
      country: 'IT',
      timezone: 'Europe/Rome',
      isActive: true,
      isOnline: false,
      currentVolume: 70,
      activationCode: '123456',
      organizationId: demoOrg.id,
      settings: {},
      managers: {
        connect: { id: manager1.id },
      },
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Roma Via del Corso',
      address: 'Via del Corso 100',
      city: 'Roma',
      country: 'IT',
      timezone: 'Europe/Rome',
      isActive: true,
      isOnline: false,
      currentVolume: 65,
      activationCode: '654321',
      organizationId: demoOrg.id,
      settings: {},
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Firenze Duomo',
      address: 'Piazza del Duomo 15',
      city: 'Firenze',
      country: 'IT',
      timezone: 'Europe/Rome',
      isActive: true,
      isOnline: false,
      currentVolume: 70,
      activationCode: '111222',
      organizationId: demoOrg.id,
      settings: {},
    },
  });

  console.log('✅ Negozi creati:', store1.name, store2.name, store3.name);

  // 6. Crea Playlist Demo
  const playlistMorning = await prisma.playlist.create({
    data: {
      name: 'Morning Vibes',
      description: 'Musica rilassante per le ore mattutine',
      mood: Mood.RELAXED,
      isActive: true,
      organizationId: demoOrg.id,
    },
  });

  const playlistAfternoon = await prisma.playlist.create({
    data: {
      name: 'Afternoon Energy',
      description: 'Musica energica per il pomeriggio',
      mood: Mood.UPBEAT,
      isActive: true,
      organizationId: demoOrg.id,
    },
  });

  const playlistEvening = await prisma.playlist.create({
    data: {
      name: 'Evening Chill',
      description: 'Atmosfera serale sofisticata',
      mood: Mood.CHILL,
      isActive: true,
      organizationId: demoOrg.id,
    },
  });

  console.log('✅ Playlist create');

  // 7. Aggiungi tracce demo
  const tracks = [
    { title: 'Peaceful Morning', artist: 'Ambient Collective', duration: 240 },
    { title: 'Sunrise Melody', artist: 'Chill Masters', duration: 195 },
    { title: 'Calm Waters', artist: 'Nature Sounds', duration: 280 },
    { title: 'Energy Boost', artist: 'DJ Retail', duration: 210 },
    { title: 'Shopping Vibes', artist: 'Store Beats', duration: 185 },
    { title: 'Evening Jazz', artist: 'Smooth Jazz Trio', duration: 320 },
  ];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const playlistId = i < 2 ? playlistMorning.id : i < 4 ? playlistAfternoon.id : playlistEvening.id;
    
    await prisma.track.create({
      data: {
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        fileUrl: `https://storage.dockfm.com/demo/${track.title.toLowerCase().replace(/\s/g, '-')}.mp3`,
        source: TrackSource.ROYALTY_FREE,
        order: i % 2,
        playlistId,
      },
    });
  }
  console.log('✅ Tracce create');

  // 8. Crea annunci demo
  const announcement1 = await prisma.announcement.create({
    data: {
      name: 'Benvenuto',
      type: AnnouncementType.WELCOME,
      text: 'Benvenuti nel nostro negozio! Siamo felici di avervi con noi.',
      audioUrl: 'https://storage.dockfm.com/demo/benvenuto.mp3',
      duration: 8,
      voiceId: 'rachel',
      isActive: true,
      priority: 5,
      organizationId: demoOrg.id,
    },
  });

  const announcement2 = await prisma.announcement.create({
    data: {
      name: 'Promo Saldi',
      type: AnnouncementType.PROMO,
      text: 'Non perdete i nostri saldi! Sconti fino al 50% su tutta la collezione.',
      audioUrl: 'https://storage.dockfm.com/demo/promo-saldi.mp3',
      duration: 12,
      voiceId: 'rachel',
      isActive: true,
      priority: 8,
      organizationId: demoOrg.id,
    },
  });

  const announcement3 = await prisma.announcement.create({
    data: {
      name: 'Chiusura',
      type: AnnouncementType.CLOSING,
      text: 'Gentili clienti, il negozio chiuderà tra 15 minuti. Vi aspettiamo presto!',
      audioUrl: 'https://storage.dockfm.com/demo/chiusura.mp3',
      duration: 10,
      voiceId: 'rachel',
      isActive: true,
      priority: 10,
      organizationId: demoOrg.id,
    },
  });

  console.log('✅ Annunci creati');

  // 9. Crea cartwall per il primo store
  await prisma.cartwallItem.createMany({
    data: [
      { storeId: store1.id, announcementId: announcement1.id, position: 0 },
      { storeId: store1.id, announcementId: announcement2.id, position: 1 },
      { storeId: store1.id, announcementId: announcement3.id, position: 2 },
    ],
  });
  console.log('✅ Cartwall configurato');

  // 10. Crea regole di programmazione
  const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
  
  for (const day of days) {
    await prisma.scheduleRule.createMany({
      data: [
        {
          storeId: store1.id,
          playlistId: playlistMorning.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '12:00',
          volume: 65,
        },
        {
          storeId: store1.id,
          playlistId: playlistAfternoon.id,
          dayOfWeek: day,
          startTime: '12:00',
          endTime: '18:00',
          volume: 70,
        },
        {
          storeId: store1.id,
          playlistId: playlistEvening.id,
          dayOfWeek: day,
          startTime: '18:00',
          endTime: '21:00',
          volume: 60,
        },
      ],
    });
  }
  console.log('✅ Programmazione settimanale configurata');

  // Imposta playlist attiva per i negozi
  await prisma.store.update({
    where: { id: store1.id },
    data: { activePlaylistId: playlistMorning.id },
  });

  console.log('');
  console.log('🎉 Seeding completato!');
  console.log('');
  console.log('📋 Credenziali Demo:');
  console.log('-------------------');
  console.log('Super Admin:');
  console.log('  Email: admin@dockfm.com');
  console.log('  Password: SuperAdmin123!');
  console.log('');
  console.log('Admin Organizzazione:');
  console.log('  Email: admin@fashionstore.demo');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('Store Manager:');
  console.log('  Email: manager.milano@fashionstore.demo');
  console.log('  Password: Manager123!');
  console.log('');
  console.log('Codici Attivazione Player:');
  console.log('  Milano Centro: 123456');
  console.log('  Roma Via del Corso: 654321');
  console.log('  Firenze Duomo: 111222');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
