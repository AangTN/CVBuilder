import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 10MB image uploaded as base64 is larger than raw bytes, so keep parser limit higher.
  const bodyLimit = process.env.REQUEST_BODY_LIMIT || '20mb';

  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // Enable cookie parser
  app.use(cookieParser());

  // Secure HTTP headers while allowing frontend origin to embed uploaded images.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global input validation – strip unknown fields, reject if validation fails
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not in DTO
      forbidNonWhitelisted: false, // don't throw on extra fields (soft whitelist)
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  // Enable CORS with credentials - cho phép cả port 3000 và 3002
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3002',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (như Postman) hoặc từ allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
