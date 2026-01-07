import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5000', 'http://localhost:5002'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('DockFm Retail API')
    .setDescription('API per la piattaforma DockFm Retail - Musica instore e annunci automatizzati')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticazione e gestione utenti')
    .addTag('organizations', 'Gestione organizzazioni (tenant)')
    .addTag('stores', 'Gestione negozi')
    .addTag('playlists', 'Gestione playlist')
    .addTag('announcements', 'Gestione annunci')
    .addTag('scheduler', 'Programmazione automatica')
    .addTag('ai', 'Generazione contenuti AI')
    .addTag('analytics', 'Statistiche e report')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5001;
  await app.listen(port);
  
  console.log(`
🚀 DockFm Retail API is running!
📍 Server: http://localhost:${port}
📚 Docs:   http://localhost:${port}/docs
  `);
}

bootstrap();
