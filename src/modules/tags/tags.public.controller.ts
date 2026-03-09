import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from 'src/guards/access.jwt.guard';
import { TagsService } from './tags.service';
import { TagsQueryDto } from './dto/tags.dto';

@ApiTags('PublicTags')
@Controller('tags')
@UseGuards(AccessJwtGuard)
export class TagPublicController {
  constructor(private readonly tagService: TagsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  getTags(@Query() query: TagsQueryDto) {
    return this.tagService.getTagsWithBlogCount(query);
  }
}
