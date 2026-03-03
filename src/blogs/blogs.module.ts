import { Module } from '@nestjs/common';
import { BlogManageController } from './blogs.manage.controller';
import { BlogPublicController } from './blogs.public.controller';

import { BlogService } from './blogs.service';

@Module({
  imports: [],
  controllers: [BlogManageController, BlogPublicController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
