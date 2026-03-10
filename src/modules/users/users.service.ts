import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UsersQueryDto,
} from './dto/users.dto';
import { UserEntity } from 'src/modules/auth/auth.entity';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { hash } from 'argon2';
import { isPrismaExistException } from 'src/util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getUsers(query: UsersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const orderBy = { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          email: true,
          nickname: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              code: true,
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map(
        (user) =>
          new UserEntity({
            ...user,
            roles: user.roles?.map((r) => r.code) ?? [],
          }),
      ),
      total,
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          select: {
            code: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserEntity({
      ...user,
      roles: user.roles?.map((r) => r.code) ?? [],
    });
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            code: true,
          },
        },
      },
    });
    return user
      ? new UserEntity({
          ...user,
          roles: user.roles?.map((r) => r.code) ?? [],
        })
      : null;
  }

  async createUser(dto: CreateUserDto) {
    try {
      const roleCodes = dto.roles ?? [];
      if (roleCodes.length > 0) {
        const existing = await this.prisma.role.findMany({
          where: { code: { in: roleCodes } },
          select: { code: true },
        });
        const existingSet = new Set(existing.map((r) => r.code));
        const missing = roleCodes.filter((c) => !existingSet.has(c));
        if (missing.length > 0) {
          throw new BadRequestException(`角色不存在: ${missing.join(', ')}`);
        }
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          nickname: dto.nickname,
          password: dto.password,
          refreshToken: dto.refreshToken,
          roles: {
            connect: roleCodes.map((code) => ({ code })),
          },
        },
        include: {
          roles: {
            select: {
              code: true,
            },
          },
        },
      });
      return new UserEntity({
        ...user,
        roles: user.roles?.map((r) => r.code) ?? [],
      });
    } catch (e) {
      if (isPrismaExistException(e)) {
        this.logger.warn(`User with email ${dto.email} already exists`);
        throw new BadRequestException(`该用户已存在`);
      }

      throw e;
    }
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    try {
      const { roles, password, ...rest } = dto;
      const roleCodes = roles ?? undefined;
      if (roleCodes && roleCodes.length > 0) {
        const existing = await this.prisma.role.findMany({
          where: { code: { in: roleCodes } },
          select: { code: true },
        });
        const existingSet = new Set(existing.map((r) => r.code));
        const missing = roleCodes.filter((c) => !existingSet.has(c));
        if (missing.length > 0) {
          throw new BadRequestException(`角色不存在: ${missing.join(', ')}`);
        }
      }

      const passwordHash = password ? await hash(password) : undefined;

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...rest,
          ...(passwordHash ? { password: passwordHash } : null),
          ...(roleCodes
            ? {
                roles: {
                  set: roleCodes.map((code) => ({ code })),
                },
              }
            : null),
        },
        include: {
          roles: {
            select: {
              code: true,
            },
          },
        },
      });
      return new UserEntity({
        ...user,
        roles: user.roles?.map((r) => r.code) ?? [],
      });
    } catch (e) {
      if (isPrismaExistException(e)) {
        this.logger.warn(`User with email ${dto.email} already exists`);
        throw new BadRequestException(`该用户已存在`);
      }

      throw e;
    }
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
      include: {
        roles: {
          select: {
            code: true,
          },
        },
      },
    });
    return new UserEntity({
      ...user,
      roles: user.roles?.map((r) => r.code) ?? [],
    });
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
    });
  }
}
