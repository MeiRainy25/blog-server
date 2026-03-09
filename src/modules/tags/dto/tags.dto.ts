import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TagsQueryDto {
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
}

export class CreateTagDto {
  @IsString()
  @ApiProperty({ example: '技术', description: '标签名称' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '蓝色', description: '标签颜色' })
  color?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '前端', description: '标签分组' })
  group?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '技术', description: '标签名称' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '蓝色', description: '标签颜色' })
  color?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '前端', description: '标签分组' })
  group?: string;
}
