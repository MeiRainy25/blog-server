import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'testuser',
    description: 'User nickname',
  })
  nickname: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  password: string;

  @ApiProperty({
    example: 'refreshToken123',
    description: 'User refresh token',
  })
  refreshToken?: string;
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
