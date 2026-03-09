import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagManageController } from './tags.manage.controller';
import { TagPublicController } from './tags.public.controller';

@Module({
  imports: [],
  controllers: [TagManageController, TagPublicController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagModule {}
