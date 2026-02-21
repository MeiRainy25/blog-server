import { ApiProperty } from '@nestjs/swagger';
import type { BlogContent } from '../interfaces/blog.interface';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { IsTiptapJson } from '../validator/tiptapJson';

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
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], description: '标签ID列表' })
  tags?: number[];
}
