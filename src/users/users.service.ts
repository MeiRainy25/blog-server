import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from './dto/users.dto';
import { UserEntity } from 'src/auth/auth.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserEntity(user));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserEntity(user);
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? new UserEntity(user) : null;
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        password: dto.password,
        refreshToken: dto.refreshToken,
      },
    });
    return new UserEntity(user);
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return new UserEntity(user);
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return new UserEntity(user);
  }

  // 修改存储的refreshToken
  async setRefreshTokenHash(userId: string, refreshTokenHash: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });
    this.logger.log(`${userId} 的refreshToken已更新`);
  }

  // 清空存储的refreshToken
  async clearRefreshToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    this.logger.log(`${userId} 的refreshToken已清空`);
  }

  // 修改密码
  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const pwd = dto.password;
    const hashed = await hash(pwd);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          password: hashed,
          refreshToken: null,
        },
      });
      this.logger.log(`${userId} 的密码已更新, refreshToken已清空`);
    });
  }
}
