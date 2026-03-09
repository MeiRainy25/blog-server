import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
