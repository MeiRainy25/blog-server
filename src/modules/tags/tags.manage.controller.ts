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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from 'src/guards/access.jwt.guard';
import { TagsService } from './tags.service';
import { CreateTagDto, TagsQueryDto, UpdateTagDto } from './dto/tags.dto';
import { RequirePermissions } from 'src/decorator/permission.decorator';

@ApiTags('ManageTags')
@Controller('manage/tags')
@UseGuards(AccessJwtGuard)
export class TagManageController {
  constructor(private readonly tagService: TagsService) {}

  @Get()
  @RequirePermissions('tag.read')
  @ApiOperation({ summary: '获取所有标签' })
  getTags(@Query() query: TagsQueryDto) {
    return this.tagService.getTagsWithBlogCount(query);
  }

  @Post()
  @RequirePermissions('tag.create')
  @ApiOperation({ summary: '创建标签' })
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagService.createTag(createTagDto);
  }

  @Put(':id')
  @RequirePermissions('tag.update')
  @ApiOperation({ summary: '更新标签' })
  updateTag(@Param('id') id: number, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.updateTag(id, updateTagDto);
  }

  @Delete(':id')
  @RequirePermissions('tag.delete')
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id') id: number) {
    return this.tagService.deleteTag(id);
  }
}
