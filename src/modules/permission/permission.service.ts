import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
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

    const permissionCodes = new Set<string>(codes);

    return permissionCodes;
  }
}
