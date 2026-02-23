import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TemplatesRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Tìm tất cả templates đang active
   */
  async findAllActive() {
    return this.prisma.templates.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Tìm template theo ID
   */
  async findById(id: string) {
    return this.prisma.templates.findUnique({
      where: { id },
    });
  }
}
