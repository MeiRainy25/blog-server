import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogsQueryDto } from './dto/blog.dto';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: '分页获取所有博客' })
  getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogService.getBlogs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个博客' })
  getBlog(@Param('id') id: string) {
    return this.blogService.getBlog(id);
  }

  @Post('search')
  @ApiOperation({ summary: '复杂条件搜索博客' })
  searchBlogs(@Body() body: BlogsQueryDto) {
    return this.blogService.getBlogs(body);
  }
}
