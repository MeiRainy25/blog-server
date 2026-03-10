import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateRoleDto, RolesQueryDto, UpdateRoleDto } from './dto/role.dto';

jest.mock('src/modules/prisma/prisma.service', () => {
  class PrismaService {}
  return { PrismaService };
});

type PrismaMock = {
  $transaction: jest.Mock;
  role: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('RoleService', () => {
  let service: RoleService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      role: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getRoles should return paginated result (total + data)', async () => {
    const roles = [{ id: 'r1', code: 'admin' }];
    prisma.$transaction.mockResolvedValue([roles, 1]);

    const res = await service.getRoles({
      page: 1,
      pageSize: 10,
    } as unknown as RolesQueryDto);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ total: 1, data: roles });
  });

  it('getAllRoles should return all roles with permissions', async () => {
    const roles = [
      {
        id: 'r1',
        code: 'admin',
        permissions: [{ code: 'user.read' }],
      },
    ];
    prisma.role.findMany.mockResolvedValue(roles);

    const res = await service.getAllRoles();

    expect(prisma.role.findMany).toHaveBeenCalledWith({
      include: {
        permissions: {
          select: {
            code: true,
          },
        },
      },
    });
    expect(res).toEqual(roles);
  });

  it('getRoleById should return a role detail with permissions', async () => {
    const role = {
      id: 'r1',
      code: 'admin',
      permissions: [{ code: 'user.read' }],
    };
    prisma.role.findUnique.mockResolvedValue(role);

    const res = await service.getRoleById('r1');

    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { id: 'r1' },
      include: {
        permissions: {
          select: {
            code: true,
          },
        },
      },
    });
    expect(res).toEqual(role);
  });

  it('createRole should connect permissions by code', async () => {
    const dto: CreateRoleDto = {
      code: 'admin',
      name: '管理员',
      description: 'desc',
      permissions: ['user.read', 'user.create'],
    };

    prisma.role.create.mockResolvedValue({ id: 'r1', ...dto });

    const res = await service.createRole(dto);

    expect(prisma.role.create).toHaveBeenCalledWith({
      data: {
        code: 'admin',
        name: '管理员',
        description: 'desc',
        permissions: {
          connect: [{ code: 'user.read' }, { code: 'user.create' }],
        },
      },
    });
    expect(res).toEqual({ id: 'r1', ...dto });
  });

  it('updateRole should set permissions by code when provided', async () => {
    const dto: UpdateRoleDto = {
      name: '管理员2',
      permissions: ['blog.read'],
    };

    prisma.role.update.mockResolvedValue({
      id: 'r1',
      code: 'admin',
      name: '管理员2',
      description: 'desc',
    });

    const res = await service.updateRole('r1', dto);

    expect(prisma.role.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: {
        ...dto,
        permissions: {
          set: [{ code: 'blog.read' }],
        },
      },
    });
    expect(res).toHaveProperty('id', 'r1');
  });

  it('updateRole should set permissions to undefined when not provided', async () => {
    const dto: UpdateRoleDto = {
      name: '管理员2',
    };

    prisma.role.update.mockResolvedValue({ id: 'r1' });

    await service.updateRole('r1', dto);

    expect(prisma.role.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: {
        ...dto,
        permissions: {
          set: undefined,
        },
      },
    });
  });

  it('deleteRole should delete by id', async () => {
    prisma.role.delete.mockResolvedValue({ id: 'r1' });

    const res = await service.deleteRole('r1');

    expect(prisma.role.delete).toHaveBeenCalledWith({
      where: { id: 'r1' },
    });
    expect(res).toEqual({ id: 'r1' });
  });
});
