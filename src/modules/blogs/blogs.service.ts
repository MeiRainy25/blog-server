import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
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

    const where = {
      ...(query.tags &&
        query.tags.length > 0 && {
          tags: {
            some: {
              id: { in: query.tags },
            },
          },
        }),
    };

    const [blogs, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        skip,
        take: pageSize,
        orderBy,
        where,
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
              color: true,
              group: true,
            },
          },
        },
      }),
      this.prisma.blog.count({ where }),
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
            color: true,
            group: true,
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
        markdown: dto.markdown,
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
        markdown: dto.markdown,
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

  async getBlogsForExport(ids: string[]) {
    return this.prisma.blog.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        markdown: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
