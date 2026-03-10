import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/decorator/permission.decorator';
import { AccessJwtGuard } from 'src/guards/access.jwt.guard';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { CreateRoleDto, RolesQueryDto, UpdateRoleDto } from './dto/role.dto';
import { RoleService } from './role.service';

@Controller('manage/role')
@ApiTags('ManageRole')
@UseGuards(AccessJwtGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('role.read')
  @ApiOperation({ summary: '获取所有角色' })
  getRoles(@Query() query: RolesQueryDto) {
    return this.roleService.getRoles(query);
  }

  @Get('all')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: '获取全部角色' })
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get(':id')
  @RequirePermissions('role.read')
  @ApiOperation({ summary: '获取角色详情' })
  getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @Post()
  @RequirePermissions('role.create')
  @ApiOperation({ summary: '新增角色' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Put(':id')
  @RequirePermissions('role.update')
  @ApiOperation({ summary: '更新角色' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('role.delete')
  @ApiOperation({ summary: '删除角色' })
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }
}
