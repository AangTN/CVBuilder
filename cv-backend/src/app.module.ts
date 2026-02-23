import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CvsModule } from './modules/cvs/cvs.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minute window
        limit: 120, // 120 requests/min globally
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 10, // 10 requests/min on auth-tagged endpoints
      },
    ]),
    AuthModule,
    TemplatesModule,
    CvsModule,
    AiModule,
    AdminModule,
    BlogModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
