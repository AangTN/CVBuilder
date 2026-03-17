import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Res,
  Header,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AvatarUploadFile } from './cvs-avatar-storage.util';
import type { Response } from 'express';
import { CvsService } from './cvs.service';
import type { CreateCvDto, UpdateCvDto, ExportCvDto } from './cvs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthRequest } from '../../common/types/auth-request.type';
import { MAX_AVATAR_BYTES } from './cvs-avatar-storage.util';
import { Public } from '../../common/decorators/public.decorator';
import type { Request as ExpressRequest } from 'express';

@Controller('cvs')
@UseGuards(JwtAuthGuard)
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Public()
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_AVATAR_BYTES,
      },
    }),
  )
  async uploadAvatar(
    @Request()
    req: ExpressRequest & { user?: { userId?: string } },
    @UploadedFile() file?: AvatarUploadFile,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh.');
    }

    const userId = req.user?.userId;
    const { photoUrl } = await this.cvsService.uploadAvatar(file, userId);
    const forwardedHost = req.headers['x-forwarded-host'];
    const forwardedProto = req.headers['x-forwarded-proto'];
    const host =
      typeof forwardedHost === 'string'
        ? forwardedHost.split(',')[0].trim()
        : req.get('host');
    const protocol =
      typeof forwardedProto === 'string'
        ? forwardedProto.split(',')[0].trim()
        : req.protocol;

    if (/^https?:\/\//i.test(photoUrl) || !host) {
      return { photoUrl };
    }

    const normalizedPath = photoUrl.startsWith('/')
      ? photoUrl
      : `/${photoUrl.replace(/^\.?\//, '')}`;

    return {
      photoUrl: `${protocol}://${host}${normalizedPath}`,
    };
  }

  @Post()
  async createCv(
    @Request() req: AuthRequest,
    @Body() createCvDto: CreateCvDto,
  ) {
    const userId = req.user.userId;
    return this.cvsService.createCv(userId, createCvDto);
  }

  @Put(':id')
  async updateCv(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const userId = req.user.userId;
    return this.cvsService.updateCv(id, userId, updateCvDto);
  }

  @Get()
  async getUserCvs(@Request() req: AuthRequest) {
    const userId = req.user.userId;
    return this.cvsService.getUserCvs(userId);
  }

  @Get('summary')
  async getUserCvsSummary(@Request() req: AuthRequest) {
    const userId = req.user.userId;
    return this.cvsService.getUserCvsSummary(userId);
  }

  @Get('exports/history')
  async getUserExportHistory(
    @Request() req: AuthRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = req.user.userId;
    const parsedPage = Number(page || 1);
    const parsedPageSize = Number(pageSize || 20);
    return this.cvsService.getUserExportHistory(
      userId,
      parsedPage,
      parsedPageSize,
    );
  }

  @Post('export')
  @Header('Content-Type', 'application/pdf')
  async exportCvAsPdf(
    @Body() exportDto: ExportCvDto,
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const pdfBuffer = await this.cvsService.exportCvFromUrl(userId, exportDto);

    // Sanitize filename to prevent HTTP header injection
    const rawName = exportDto.filename || 'CV';
    const safeFilename = rawName.replace(/[^\w\-. ]/g, '_').slice(0, 100);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Post('export-create')
  async createExportCv(
    @Body() createCvDto: CreateCvDto,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.cvsService.createExportCv(userId, createCvDto);
  }

  @Get(':id')
  async getCvById(@Param('id') id: string, @Request() req: AuthRequest) {
    const userId = req.user.userId;
    return this.cvsService.getCvById(id, userId);
  }

  @Delete(':id')
  async deleteCv(@Param('id') id: string, @Request() req: AuthRequest) {
    const userId = req.user.userId;
    return this.cvsService.deleteCv(id, userId);
  }
}
