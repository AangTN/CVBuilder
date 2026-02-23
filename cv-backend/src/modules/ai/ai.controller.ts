import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import type { AuthenticatedUser } from '../../common/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('score-insight')
  async scoreInsight(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      cvId?: string;
      cvData: unknown;
      jobDescription?: string;
      targetRole?: string;
      language?: 'vi' | 'en' | 'ja' | 'ko' | 'zh';
    },
  ) {
    const result = await this.aiService.scoreInsight(body);

    return {
      ...result,
      creditsSpent: 2,
      feature: 'score-insight',
      userId: user.userId,
    };
  }

  @Post('optimize-bullet')
  async optimizeBullet(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      field?: string;
      text?: string;
      targetRole?: string;
      keywords?: string[];
      sectionId?: string;
      sectionData?: unknown;
      jobTitle?: string;
      language?: 'vi' | 'en' | 'ja' | 'ko' | 'zh';
    },
  ) {
    const result = await this.aiService.optimizeBullet(body);

    return {
      ...result,
      creditsSpent: 1,
      feature: 'optimize-bullet',
      userId: user.userId,
    };
  }

  @Post('chat-assistant')
  async chatAssistant(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      message: string;
      cvData: unknown;
      language?: 'vi' | 'en' | 'ja' | 'ko' | 'zh';
    },
  ) {
    const result = await this.aiService.chatAssistant(body);

    return {
      ...result,
      creditsSpent: 3,
      feature: 'chat-assistant',
      userId: user.userId,
    };
  }
}
