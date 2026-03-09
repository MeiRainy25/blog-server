import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/decorator/permission.decorator';
import { PermissionService } from 'src/modules/permission/permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 未声明权限点, 直接放行
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.sub;

    if (!userId) {
      throw new ForbiddenException();
    }

    const codes = await this.permissionService.getUserPermissions(userId);

    const ok = required.every((p) => codes.has(p));
    if (!ok) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}
