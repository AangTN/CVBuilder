import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { templates } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<templates[]> {
    return this.prisma.templates.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<templates | null> {
    return this.prisma.templates.findUnique({
      where: { id },
    });
  }
}
