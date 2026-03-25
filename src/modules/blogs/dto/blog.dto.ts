import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BlogContent } from '../interfaces/blog.interface';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsTiptapJson } from '../validator/tiptapJson';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @ApiProperty({ example: 'My First Blog', description: '博客标题' })
  title: string;

  @IsTiptapJson()
  @ApiProperty({
    example: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    },
    description: '博客内容（TipTap JSON）',
  })
  content: BlogContent;

  @IsString()
  @ApiProperty({
    example: 'Hello, this is a markdown content.',
    description: '博客内容（Markdown文本）, 用于博客导出',
  })
  markdown: string;

  @IsString()
  @ApiProperty({ example: 'userId123', description: '作者ID' })
  authorId: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], description: '标签ID列表' })
  tags?: number[];
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'My First Blog', description: '博客标题' })
  title?: string;

  @IsOptional()
  @IsTiptapJson()
  @ApiProperty({
    example: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    },
    description: '博客内容（TipTap JSON）',
  })
  content?: BlogContent;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Hello, this is a markdown content.',
    description: '博客内容（Markdown文本）, 用于博客导出',
  })
  markdown?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], description: '标签ID列表' })
  tags?: number[];
}

export class BlogsQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, description: '页码，默认为1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ example: 10, description: '单页数据量, 默认10' })
  pageSize?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  @ApiPropertyOptional({
    example: 'createdAt',
    description: '排序字段，默认为createdAt',
  })
  sortBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiPropertyOptional({
    example: 'desc',
    description: '排序方式，默认为desc',
  })
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => parseInt(v.trim(), 10));
    }
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(String(v), 10));
    }
    return [];
  })
  @IsArray()
  @ApiPropertyOptional({
    example: '1,2,3',
    description: '标签ID列表，用逗号分隔',
  })
  tags?: number[];
}
