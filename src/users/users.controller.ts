import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/users.dto';
import { AccessJwtGuard } from 'src/auth/guards/access.jwt.guard';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Users')
@Controller('users')
@UseGuards(AccessJwtGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户信息' })
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户信息' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
