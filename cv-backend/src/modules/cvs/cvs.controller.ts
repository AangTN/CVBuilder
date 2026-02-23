import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  Header,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { CvsService } from './cvs.service';
import type { CreateCvDto, UpdateCvDto, ExportCvDto } from './cvs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthRequest } from '../../common/types/auth-request.type';

@Controller('cvs')
@UseGuards(JwtAuthGuard)
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

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
