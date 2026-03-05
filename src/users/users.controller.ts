import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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
import { AccessJwtGuard } from 'src/auth/guards/access.jwt.guard';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Users')
@Controller('manage/users')
@UseGuards(AccessJwtGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户信息' })
  async getUsers(@Query() query: UsersQueryDto) {
    return this.userService.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户信息' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
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
