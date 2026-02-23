import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  @Get('dashboard-stats')
  async getDashboardStats(
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.getDashboardStats({ period, from, to });
  }

  // ─── Accounts ───────────────────────────────────────────────────────────────

  @Get('accounts')
  async getAccounts() {
    return this.adminService.getAccounts();
  }

  @Patch('accounts/:id')
  async updateAccount(
    @Param('id') id: string,
    @Body() body: { role?: string; isActive?: boolean },
    @CurrentUser() currentUser: { userId: string },
  ) {
    if (id === currentUser.userId) {
      throw new ForbiddenException(
        'Không thể thay đổi tài khoản của chính mình',
      );
    }
    return this.adminService.updateAccount(id, body);
  }

  // ─── Blog Categories ────────────────────────────────────────────────────────

  @Get('blog/categories')
  async getBlogCategories() {
    return this.adminService.getBlogCategories();
  }

  @Post('blog/categories')
  async createBlogCategory(
    @Body() body: { name: string; slug: string; description?: string },
  ) {
    return this.adminService.createBlogCategory(body);
  }

  @Patch('blog/categories/:id')
  async updateBlogCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string },
  ) {
    return this.adminService.updateBlogCategory(id, body);
  }

  @Delete('blog/categories/:id')
  async deleteBlogCategory(@Param('id') id: string) {
    return this.adminService.deleteBlogCategory(id);
  }

  // ─── Blog Posts ─────────────────────────────────────────────────────────────

  @Get('blog/posts')
  async getBlogPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getBlogPosts({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      status,
    });
  }

  @Get('blog/posts/:id')
  async getBlogPost(@Param('id') id: string) {
    return this.adminService.getBlogPostById(id);
  }

  @Post('blog/posts')
  async createBlogPost(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      title: string;
      slug: string;
      content: string;
      categoryId?: string;
      summary?: string;
      thumbnail?: string;
      status?: 'draft' | 'published';
      metaTitle?: string;
      metaDescription?: string;
      tagIds?: string[];
    },
  ) {
    return this.adminService.createBlogPost({ ...body, authorId: user.userId });
  }

  @Patch('blog/posts/:id')
  async updateBlogPost(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      slug?: string;
      content?: string;
      categoryId?: string | null;
      summary?: string;
      thumbnail?: string;
      status?: 'draft' | 'published';
      metaTitle?: string;
      metaDescription?: string;
      tagIds?: string[];
    },
  ) {
    return this.adminService.updateBlogPost(id, body);
  }

  @Delete('blog/posts/:id')
  async deleteBlogPost(@Param('id') id: string) {
    return this.adminService.deleteBlogPost(id);
  }

  // ─── Blog Tags ───────────────────────────────────────────────────────

  @Get('blog/tags')
  async getBlogTags() {
    return this.adminService.getBlogTags();
  }

  @Post('blog/tags')
  async createBlogTag(@Body() body: { name: string; slug: string }) {
    return this.adminService.createBlogTag(body);
  }

  @Patch('blog/tags/:id')
  async updateBlogTag(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.adminService.updateBlogTag(id, body);
  }

  @Delete('blog/tags/:id')
  async deleteBlogTag(@Param('id') id: string) {
    return this.adminService.deleteBlogTag(id);
  }
}
