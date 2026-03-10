import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsArray,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UsersQueryDto {
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

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'test@example.com',
    description: 'User email address',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'testuser',
    description: 'User nickname',
  })
  nickname?: string;

  @IsOptional()
  @MinLength(6)
  @IsString()
  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  password?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    example: ['admin', 'editor'],
    description: '用户角色 code 列表（可选）',
  })
  roles?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'refreshToken123',
    description: 'User refresh token',
  })
  refreshToken?: string;
}

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'test@example.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'testuser',
    description: 'User nickname',
  })
  nickname: string;

  @MinLength(6)
  @IsString()
  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    example: ['admin', 'editor'],
    description: '用户角色 code 列表（可选）',
  })
  roles?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'refreshToken123',
    description: 'User refresh token',
  })
  refreshToken?: string;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'newpassword', description: '修改后的新密码' })
  password: string;
}
