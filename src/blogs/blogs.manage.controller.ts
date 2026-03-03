import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blogs.service';
import { BlogsQueryDto, CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from 'src/auth/guards/access.jwt.guard';

@ApiTags('ManageBlogs')
@Controller('manage/blogs')
@UseGuards(AccessJwtGuard)
export class BlogManageController {
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
