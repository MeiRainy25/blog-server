import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlogsQueryDto, CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  async getBlogs(query: BlogsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const orderBy = { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' };
    const [blogs, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,

          author: {
            select: {
              id: true,
              nickname: true,
            },
          },

          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.blog.count(),
    ]);

    return {
      total,
      data: blogs,
    };
  }

  async getBlog(id: string) {
    return this.prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
    this.logger.debug(`Updating blog ${id} with data: ${JSON.stringify(dto)}`);
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
