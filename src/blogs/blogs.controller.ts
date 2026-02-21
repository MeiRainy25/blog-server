import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BlogService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: '获取所有博客' })
  getBlogs() {
    return this.blogService.getBlogs();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个博客' })
  getBlog(@Param('id') id: string) {
    return this.blogService.getBlog(id);
  }

  @Post()
  @ApiOperation({ summary: '创建博客' })
  createBlog(@Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新博客' })
  updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.updateBlog(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除博客' })
  deleteBlog(@Param('id') id: string) {
    return this.blogService.deleteBlog(id);
  }
}
