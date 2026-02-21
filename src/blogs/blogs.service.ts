import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  async getBlogs() {
    return this.prisma.blog.findMany();
  }

  async getBlog(id: string) {
    return this.prisma.blog.findUnique({
      where: { id },
    });
  }

  async createBlog(dto: CreateBlogDto) {
    return this.prisma.blog.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: dto.authorId,
        tags: {
          connect: dto.tags?.map((id) => ({ id })) ?? [],
        },
      },
    });
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    return await this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        tags: {
          set: dto.tags?.map((id) => ({ id })) ?? [],
        },
      },
    });
  }

  async deleteBlog(id: string) {
    return this.prisma.blog.delete({
      where: { id },
    });
  }
}
