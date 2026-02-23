import { Module } from '@nestjs/common';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { CvsRepository } from './cvs.repository';
import { PdfService } from './pdf.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CvsController],
  providers: [CvsService, CvsRepository, PdfService, PrismaService],
  exports: [CvsService],
})
export class CvsModule {}
