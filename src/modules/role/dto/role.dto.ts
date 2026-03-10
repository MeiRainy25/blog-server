import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @ApiProperty({ example: 'admin', description: '角色代码' })
  code: string;

  @IsString()
  @ApiProperty({ example: '管理员', description: '角色名称' })
  name: string;

  @IsString()
  @ApiProperty({ example: '管理员', description: '角色描述' })
  description: string;

  @IsString({ each: true })
  @ApiProperty({ example: ['blog.read'], description: '角色权限' })
  permissions: string[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'admin', description: '角色代码' })
  code?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '管理员', description: '角色名称' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '管理员', description: '角色描述' })
  description?: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ example: ['blog.read'], description: '角色权限' })
  permissions?: string[];
}

export class RolesQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, description: '页码，默认1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ example: 10, description: '单页数量，默认10' })
  pageSize?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  @ApiPropertyOptional({
    example: 'createdAt',
    description: '排序字段，默认 createdAt',
  })
  sortBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiPropertyOptional({ example: 'desc', description: '排序方式，默认 desc' })
  order?: 'asc' | 'desc' = 'desc';
}
