import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, RolesQueryDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 获取角色(分页)
  async getRoles(query: RolesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const orderBy = { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' };

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        skip,
        take: pageSize,
        orderBy,
        include: {
          permissions: {
            select: {
              code: true,
            },
          },
        },
      }),
      this.prisma.role.count(),
    ]);

    return {
      total,
      data: roles,
    };
  }

  // 获取全部角色
  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          select: {
            code: true,
          },
        },
      },
    });
    return roles;
  }

  // 获取角色详情
  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            code: true,
          },
        },
      },
    });
    return {
      ...role,
      permissions: role?.permissions?.map((p) => p.code) ?? [],
    };
  }

  // 新增角色
  async createRole(data: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissions.map((code) => ({ code })),
        },
      },
    });
    return role;
  }

  // 更新角色
  async updateRole(id: string, data: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        ...data,
        permissions: {
          set: data.permissions?.map((code) => ({ code })),
        },
      },
    });
    return role;
  }

  // 删除角色
  async deleteRole(id: string) {
    const role = await this.prisma.role.delete({
      where: { id },
    });
    return role;
  }
}
