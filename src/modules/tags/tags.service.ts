import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto, TagsQueryDto, UpdateTagDto } from './dto/tags.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取带博客数量的全部标签
   * @param query
   * @returns total: 标签总数 data: 标签列表
   */
  async getTagsWithBlogCount(query: TagsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const orderBy = { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' };
    const [tags, total] = await this.prisma.$transaction([
      this.prisma.tag.findMany({
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          group: true,
          color: true,
          _count: { select: { blogs: true } },
        },
      }),
      this.prisma.tag.count(),
    ]);

    const data = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      group: tag.group,
      color: tag.color,
      count: tag._count.blogs,
    }));

    return {
      total,
      data,
    };
  }

  /**
   * 获取不带博客数量的全部标签
   * @param query
   * @returns total: 标签总数 data: 标签列表
   */
  async getTagsPlain(query: TagsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const orderBy = { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' };
    const [tags, total] = await this.prisma.$transaction(async (client) => {
      const tags = await client.tag.findMany({
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          group: true,
          color: true,
        },
      });
      const total = client.tag.count();
      return [tags, total];
    });

    return {
      total,
      data: tags,
    };
  }

  /**
   * 创建标签
   * @param data
   * @returns
   */
  async createTag(data: CreateTagDto) {
    const tag = await this.findTagByName(data.name);
    if (tag) {
      throw new BadRequestException('标签已存在');
    }
    return this.prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
        group: data.group,
      },
    });
  }

  /**
   * 更新标签
   * @param id
   * @param data
   * @returns
   */
  async updateTag(id: number, data: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('不存在该Tag!');
    }
    return this.prisma.tag.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        group: data.group,
      },
    });
  }

  /**
   * 删除标签
   * @param id
   * @returns
   */
  async deleteTag(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('不存在该Tag!');
    }
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * 根据名称查找标签
   */
  async findTagByName(name: string) {
    return await this.prisma.tag.findUnique({
      where: {
        name,
      },
    });
  }
}
