import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UsersQueryDto } from './dto/users.dto';
import { AccessJwtGuard } from 'src/guards/access.jwt.guard';
import { RequirePermissions } from 'src/decorator/permission.decorator';
import type { Request } from 'express';
import * as argon2 from 'argon2';
import { PermissionsGuard } from 'src/guards/permission.guard';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Users')
@Controller('manage/users')
@UseGuards(AccessJwtGuard, PermissionsGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userService: UsersService) {}

  @Get()
  @RequirePermissions('user.read')
  @ApiOperation({ summary: '获取所有用户信息' })
  async getUsers(@Query() query: UsersQueryDto) {
    return this.userService.getUsers(query);
  }

  @Get(':id')
  @RequirePermissions('user.read')
  @ApiOperation({ summary: '获取单个用户信息' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @RequirePermissions('user.create')
  @ApiOperation({ summary: '创建用户' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser({
      ...dto,
      password: await argon2.hash(dto.password),
    });
  }

  @Put(':id')
  @RequirePermissions('user.update')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
