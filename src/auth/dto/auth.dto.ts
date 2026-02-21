import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @ApiProperty({ example: 'test@example.com', description: '用户邮箱' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'password', description: '用户密码' })
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'New User', description: '用户昵称' })
  nickname?: string;
}

export class LoginDto {
  @IsEmail()
  @IsString()
  @ApiProperty({ example: 'test@example.com', description: '用户邮箱' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'password', description: '用户密码' })
  password: string;
}
