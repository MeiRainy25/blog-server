import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 获取用户权限
  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          select: {
            permissions: {
              select: { code: true },
            },
          },
        },
      },
    });
    const codes: string[] =
      user?.roles.flatMap((role) => {
        const pCodes = role.permissions.map((p) => p.code);
        return pCodes;
      }) ?? [];

    return [...new Set(codes)];
  }

  // 获取所有权限
  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany();
    return permissions;
  }
}
