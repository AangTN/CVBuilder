import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CvsRepository } from './cvs.repository';
import { PdfService } from './pdf.service';
import { PrismaService } from '../../prisma.service';
import {
  AvatarUploadFile,
  deleteOldPhoto,
  isManagedUploadPhotoUrl,
  processPhotoUrl,
  storeUploadedAvatar,
} from './cvs-avatar-storage.util';
import {
  getPhotoUrlFromContent,
  isJsonContentObject,
  sanitizeContent,
} from './cvs-sanitizer.util';
import {
  CreateCvDto,
  ExportCvDto,
  SECTION_TYPES,
  SectionType,
  UpdateCvDto,
} from './cvs.types';

export type { CreateCvDto, UpdateCvDto, ExportCvDto } from './cvs.types';

@Injectable()
export class CvsService {
  private readonly logger = new Logger(CvsService.name);

  constructor(
    private readonly cvsRepository: CvsRepository,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async uploadAvatar(file: AvatarUploadFile, userId?: string) {
    const ownerKey = userId ? `user-${userId}` : 'guest';
    this.logger.log(`Uploading avatar for: ${ownerKey}`);
    const photoUrl = await storeUploadedAvatar(
      file,
      ownerKey,
      this.logger,
    );

    return { photoUrl };
  }

  private isInvalidSectionTypeError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2007'
    );
  }

  private toSectionType(value: string): SectionType {
    if ((SECTION_TYPES as readonly string[]).includes(value)) {
      return value as SectionType;
    }
    return 'custom';
  }

  private toPrismaJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }

  private async getOrCreateTemplate(templateIdOrNumber: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(templateIdOrNumber)) {
      throw new BadRequestException(
        `Template ID không hợp lệ: "${templateIdOrNumber}". Vui lòng sử dụng UUID hợp lệ.`,
      );
    }

    const template = await this.prisma.templates.findUnique({
      where: { id: templateIdOrNumber },
    });

    if (!template) {
      throw new NotFoundException(
        `Template với ID "${templateIdOrNumber}" không tồn tại`,
      );
    }

    return template;
  }

  private async replaceSections(
    cvId: string,
    sections: CreateCvDto['sections'],
    oldPhotoUrl?: string,
  ): Promise<void> {
    let previousPhotoUrl = oldPhotoUrl;

    for (const section of sections) {
      const normalizedSectionType = this.toSectionType(section.section_type);

      let cvSection: Awaited<ReturnType<CvsRepository['createSection']>>;
      try {
        cvSection = await this.cvsRepository.createSection({
          section_type: normalizedSectionType,
          title: section.title,
          is_visible: section.is_visible ?? true,
          cvs: {
            connect: { id: cvId },
          },
        });
      } catch (error) {
        if (
          normalizedSectionType !== 'custom' &&
          this.isInvalidSectionTypeError(error)
        ) {
          this.logger.warn(
            `Section type \"${normalizedSectionType}\" is not supported by current DB enum. Falling back to \"custom\". Please run latest Prisma migrations.`,
          );

          cvSection = await this.cvsRepository.createSection({
            section_type: 'custom',
            title: section.title,
            is_visible: section.is_visible ?? true,
            cvs: {
              connect: { id: cvId },
            },
          });
        } else {
          throw error;
        }
      }

      for (const item of section.items) {
        let processedContent = sanitizeContent(item.content);

        if (
          section.section_type === 'header' &&
          isJsonContentObject(processedContent)
        ) {
          const photoUrl = getPhotoUrlFromContent(processedContent);
          const newPhotoUrl = await processPhotoUrl(
            photoUrl,
            cvId,
            this.logger,
          );

          if (
            previousPhotoUrl &&
            previousPhotoUrl !== newPhotoUrl &&
            isManagedUploadPhotoUrl(previousPhotoUrl)
          ) {
            await deleteOldPhoto(previousPhotoUrl, this.logger);
            previousPhotoUrl = undefined;
          }

          processedContent = {
            ...processedContent,
            photo_url: newPhotoUrl,
          };
        }

        await this.cvsRepository.createSectionItem({
          content: this.toPrismaJson(processedContent),
          position: item.position || 0,
          cv_sections: {
            connect: { id: cvSection.id },
          },
        });
      }
    }
  }

  async createCv(userId: string, createCvDto: CreateCvDto) {
    const { template_id, language, settings, sections, name } = createCvDto;

    this.logger.log(
      `Creating CV for user: ${userId}, template: ${template_id}`,
    );

    const template = await this.getOrCreateTemplate(template_id);

    const cv = await this.cvsRepository.create({
      name: name || new Date().toISOString(),
      language: language || 'vi',
      settings: settings || {},
      status: 'active',
      cv_exports: false,
      users: {
        connect: { id: userId },
      },
      templates: {
        connect: { id: template.id },
      },
    });

    await this.replaceSections(cv.id, sections);

    const createdCv = await this.cvsRepository.findById(cv.id);
    if (!createdCv) {
      throw new NotFoundException('Không thể tìm thấy CV vừa tạo');
    }

    this.logger.log(
      `CV created successfully: ${createdCv.id} for user: ${userId}`,
    );
    return createdCv;
  }

  async createExportCv(userId: string, createCvDto: CreateCvDto) {
    const { template_id, language, settings, sections, name } = createCvDto;

    this.logger.log(
      `Creating export CV for user: ${userId}, template: ${template_id}`,
    );

    const template = await this.getOrCreateTemplate(template_id);

    const cv = await this.cvsRepository.create({
      name: name || new Date().toISOString(),
      language: language || 'vi',
      status: 'active',
      cv_exports: true,
      settings: settings || {},
      users: {
        connect: { id: userId },
      },
      templates: {
        connect: { id: template.id },
      },
    });

    await this.replaceSections(cv.id, sections);

    this.logger.log(`Export CV created: ${cv.id} for user: ${userId}`);
    return { id: cv.id };
  }

  async updateCv(cvId: string, userId: string, updateCvDto: UpdateCvDto) {
    this.logger.log(`Updating CV: ${cvId} by user: ${userId}`);

    const cv = await this.cvsRepository.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV không tồn tại');
    }

    if (cv.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa CV này');
    }

    const { template_id, language, settings, sections, status } = updateCvDto;

    const updateData: Prisma.cvsUpdateInput = {};
    if (template_id) {
      const template = await this.getOrCreateTemplate(template_id);
      updateData.templates = { connect: { id: template.id } };
    }
    if (language) updateData.language = language;
    if (settings) updateData.settings = settings;
    if (status) updateData.status = status;

    await this.cvsRepository.update(cvId, updateData);

    if (sections) {
      const oldHeaderSection = cv.cv_sections?.find(
        (section) => section.section_type === 'header',
      );
      const oldContent = oldHeaderSection?.cv_section_items?.[0]?.content;
      const oldPhotoUrl = getPhotoUrlFromContent(oldContent);

      await this.cvsRepository.deleteSectionsByCvId(cvId);
      await this.replaceSections(cvId, sections, oldPhotoUrl);
    }

    const updatedCv = await this.cvsRepository.findById(cvId);
    if (!updatedCv) {
      throw new NotFoundException('Không thể tìm thấy CV sau khi cập nhật');
    }

    this.logger.log(`CV updated successfully: ${cvId}`);
    return updatedCv;
  }

  async getCvById(cvId: string, userId?: string) {
    const cv = await this.cvsRepository.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV không tồn tại');
    }

    if (userId && cv.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem CV này');
    }

    return cv;
  }

  async getUserCvs(userId: string) {
    return this.cvsRepository.findByUserId(userId);
  }

  async getUserCvsSummary(userId: string) {
    return this.cvsRepository.findSummaryByUserId(userId);
  }

  async getUserExportHistory(userId: string, page = 1, pageSize = 20) {
    const safePage = Number.isNaN(page) ? 1 : Math.max(1, page);
    const safePageSize = Number.isNaN(pageSize)
      ? 20
      : Math.min(50, Math.max(1, pageSize));
    const skip = (safePage - 1) * safePageSize;

    const { items, total } = await this.cvsRepository.findExportHistoryByUserId(
      userId,
      skip,
      safePageSize,
    );

    return {
      items,
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / safePageSize)),
      },
    };
  }

  async deleteCv(cvId: string, userId: string) {
    this.logger.log(`Deleting CV: ${cvId} by user: ${userId}`);

    const cv = await this.cvsRepository.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV không tồn tại');
    }

    if (cv.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa CV này');
    }

    return this.cvsRepository.delete(cvId);
  }

  async exportCvFromUrl(
    userId: string,
    exportDto: ExportCvDto,
  ): Promise<Buffer> {
    this.logger.log(`Exporting CV as PDF by user: ${userId}`);

    if (!exportDto.cvId) {
      throw new BadRequestException('Thiếu cvId để export CV');
    }

    const exportRenderKey = process.env.EXPORT_RENDER_KEY;
    if (!exportRenderKey) {
      throw new BadRequestException(
        'Thiếu cấu hình EXPORT_RENDER_KEY trên server',
      );
    }

    const frontendUrl =
      process.env.FRONTEND_EXPORT_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    const cv = await this.getCvById(exportDto.cvId, userId);
    const normalized = {
      template_id: cv.template_id || cv.templates?.id,
      language: cv.language || 'vi',
      settings: cv.settings || {},
      sections: (cv.cv_sections || []).map((section) => ({
        id: section.id,
        cv_id: section.cv_id,
        section_type: section.section_type,
        title: section.title,
        is_visible: section.is_visible ?? true,
        items: (section.cv_section_items || [])
          .map((item) => ({
            id: item.id,
            section_id: item.section_id,
            content: sanitizeContent(item.content),
            position: item.position ?? 0,
          }))
          .sort((a, b) => a.position - b.position),
      })),
    };

    const json = JSON.stringify(normalized);
    const encodedData = Buffer.from(json, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const exportUrl = `${frontendUrl}/export?data=${encodeURIComponent(encodedData)}&k=${encodeURIComponent(exportRenderKey)}`;

    const pdfBuffer = await this.pdfService.generatePdfFromUrl(exportUrl);
    this.logger.log(`PDF generated successfully from URL for user: ${userId}`);
    return pdfBuffer;
  }
}
