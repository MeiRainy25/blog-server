import { Module } from '@nestjs/common';
import { BlogController } from './blogs.controller';
import { BlogService } from './blogs.service';

@Module({
  imports: [],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
