import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

jest.mock('src/modules/prisma/prisma.service', () => {
  class PrismaService {}
  return { PrismaService };
});

jest.mock('argon2', () => {
  return {
    hash: jest.fn(),
  };
});

jest.mock('src/util', () => {
  return {
    isPrismaExistException: jest.fn(),
  };
});

import { hash } from 'argon2';
import { isPrismaExistException } from 'src/util';

type PrismaMock = {
  user: {
    create: jest.Mock;
    update: jest.Mock;
  };
  role: {
    findMany: jest.Mock;
  };
};

// 测试分组
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;
  const now = new Date();

  // 初始化测试环境
  beforeEach(async () => {
    // 创建prisma
    prisma = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findMany: jest.fn(),
      },
    };

    (hash as unknown as jest.Mock).mockResolvedValue('hashed_password');
    (isPrismaExistException as unknown as jest.Mock).mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user without roles', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'x',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
      });

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashedInController',
      } as unknown as CreateUserDto;

      const res = await service.createUser(dto);

      expect(prisma.role.findMany).not.toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'a@b.com',
          nickname: 'nick',
          password: 'hashedInController',
          refreshToken: undefined,
          roles: {
            connect: [],
          },
        },
      });
      expect(res).toHaveProperty('id', 'u1');
    });

    it('should create user with roles (connect by code)', async () => {
      prisma.role.findMany.mockResolvedValue([
        { code: 'admin' },
        { code: 'editor' },
      ]);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'x',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
      });

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashedInController',
        roles: ['admin', 'editor'],
      } as unknown as CreateUserDto;

      await service.createUser(dto);

      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['admin', 'editor'] } },
        select: { code: true },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'a@b.com',
          nickname: 'nick',
          password: 'hashedInController',
          refreshToken: undefined,
          roles: {
            connect: [{ code: 'admin' }, { code: 'editor' }],
          },
        },
      });
    });

    it('should throw when roles contain missing codes', async () => {
      prisma.role.findMany.mockResolvedValue([{ code: 'admin' }]);

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashedInController',
        roles: ['admin', 'missing'],
      } as unknown as CreateUserDto;

      await expect(service.createUser(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should map prisma unique constraint error to BadRequestException', async () => {
      (isPrismaExistException as unknown as jest.Mock).mockReturnValue(true);
      prisma.user.create.mockRejectedValue(new Error('P2002'));

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashedInController',
      } as unknown as CreateUserDto;

      await expect(service.createUser(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update without roles and without password (no hash)', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick2',
        password: 'old',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
      });

      const dto = {
        nickname: 'nick2',
      } as unknown as UpdateUserDto;

      await service.updateUser('u1', dto);

      expect(hash).not.toHaveBeenCalled();
      expect(prisma.role.findMany).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          nickname: 'nick2',
        },
      });
    });

    it('should update password with hash', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick2',
        password: 'new',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
      });

      const dto = {
        password: 'plain',
      } as unknown as UpdateUserDto;

      await service.updateUser('u1', dto);

      expect(hash).toHaveBeenCalledWith('plain');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          password: 'hashed_password',
        },
      });
    });

    it('should set roles when roles provided (set by code)', async () => {
      prisma.role.findMany.mockResolvedValue([{ code: 'admin' }]);
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick2',
        password: 'old',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
      });

      const dto = {
        roles: ['admin'],
      } as unknown as UpdateUserDto;

      await service.updateUser('u1', dto);

      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['admin'] } },
        select: { code: true },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          roles: {
            set: [{ code: 'admin' }],
          },
        },
      });
    });

    it('should throw when roles contain missing codes', async () => {
      prisma.role.findMany.mockResolvedValue([{ code: 'admin' }]);

      const dto = {
        roles: ['admin', 'missing'],
      } as unknown as UpdateUserDto;

      await expect(service.updateUser('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should map prisma unique constraint error to BadRequestException', async () => {
      (isPrismaExistException as unknown as jest.Mock).mockReturnValue(true);
      prisma.user.update.mockRejectedValue(new Error('P2002'));

      const dto = {
        email: 'dup@b.com',
      } as unknown as UpdateUserDto;

      await expect(service.updateUser('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should create user with empty role array', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
        roles: [],
      });

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        roles: [],
      } as unknown as CreateUserDto;

      const res = await service.createUser(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'a@b.com',
          nickname: 'nick',
          password: 'hashed_password',
          roles: {
            connect: [],
          },
        },
      });
      expect(res).toEqual({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
        roles: [],
      });
    });

    it('should update user with empty role array', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
        roles: [],
      });

      const dto = {
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        roles: [],
      } as unknown as UpdateUserDto;

      const res = await service.updateUser('u1', dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          email: 'a@b.com',
          nickname: 'nick',
          password: 'hashed_password',
          roles: {
            set: [],
          },
        },
      });
      expect(res).toEqual({
        id: 'u1',
        email: 'a@b.com',
        nickname: 'nick',
        password: 'hashed_password',
        refreshToken: null,
        createdAt: now,
        updatedAt: now,
        roles: [],
      });
    });
  });
});
