import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { TagsQueryDto } from './dto/tags.dto';

@ApiTags('PublicTags')
@Controller('tags')
export class TagPublicController {
  constructor(private readonly tagService: TagsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  getTags(@Query() query: TagsQueryDto) {
    return this.tagService.getTagsWithBlogCount(query);
  }
}
