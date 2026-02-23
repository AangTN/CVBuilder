import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  async getPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') categorySlug?: string,
    @Query('tag') tagSlug?: string,
    @Query('q') q?: string,
  ) {
    return this.blogService.getPosts({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      categorySlug,
      tagSlug,
      q,
    });
  }

  @Get('posts/:slug')
  async getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  @Get('categories')
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Get('tags')
  async getTags() {
    return this.blogService.getTags();
  }
}
