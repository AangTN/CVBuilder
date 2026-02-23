import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CvsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.cvsCreateInput) {
    return this.prisma.cvs.create({
      data,
      include: {
        cv_sections: {
          include: {
            cv_section_items: true,
          },
        },
        templates: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.cvs.findUnique({
      where: { id },
      include: {
        cv_sections: {
          include: {
            cv_section_items: true,
          },
        },
        templates: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.cvs.findMany({
      where: {
        user_id: userId,
        status: 'active',
        cv_exports: false,
      },
      include: {
        cv_sections: {
          include: {
            cv_section_items: true,
          },
        },
        templates: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async findSummaryByUserId(userId: string) {
    return this.prisma.cvs.findMany({
      where: {
        user_id: userId,
        status: 'active',
        cv_exports: false,
      },
      select: {
        id: true,
        name: true,
        template_id: true,
        language: true,
        created_at: true,
        updated_at: true,
        templates: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async findExportHistoryByUserId(userId: string, skip = 0, take = 20) {
    const where: Prisma.cvsWhereInput = {
      user_id: userId,
      status: 'active',
      cv_exports: true,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.cvs.findMany({
        where,
        include: {
          templates: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.cvs.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.cvsUpdateInput) {
    return this.prisma.cvs.update({
      where: { id },
      data,
      include: {
        cv_sections: {
          include: {
            cv_section_items: true,
          },
        },
        templates: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.cvs.delete({
      where: { id },
    });
  }

  async createSection(data: Prisma.cv_sectionsCreateInput) {
    return this.prisma.cv_sections.create({
      data,
      include: {
        cv_section_items: true,
      },
    });
  }

  async createSectionItem(data: Prisma.cv_section_itemsCreateInput) {
    return this.prisma.cv_section_items.create({
      data,
    });
  }

  async deleteSectionsByCvId(cvId: string) {
    return this.prisma.cv_sections.deleteMany({
      where: { cv_id: cvId },
    });
  }
}
