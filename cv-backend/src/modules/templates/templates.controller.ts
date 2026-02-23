import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const template = await this.templatesService.findOne(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }
}
