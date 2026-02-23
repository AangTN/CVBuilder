import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplatesRepository } from './templates.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesRepository, PrismaService],
})
export class TemplatesModule {}
