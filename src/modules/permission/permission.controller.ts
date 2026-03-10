import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from 'src/guards/access.jwt.guard';
import { PermissionService } from './permission.service';
import type { Request } from 'express';

@ApiTags('Permission')
@Controller('manage/permission')
@UseGuards(AccessJwtGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('me')
  @ApiOperation({ summary: '获取用户权限信息' })
  async getUserPermissions(@Req() req: Request) {
    const user = req.user as { sub: string; email: string; nickname: string };

    return this.permissionService.getUserPermissions(user.sub);
  }

  @Get()
  @ApiOperation({ summary: '获取所有权限信息' })
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }
}
