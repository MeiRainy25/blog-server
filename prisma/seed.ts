import 'dotenv/config';
import { PrismaClient } from 'lib/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

const permissions = [
  {
    code: 'blog.read',
    name: '查看博客',
    description: '允许用户查看博客文章',
  },
  {
    code: 'blog.create',
    name: '创建博客',
    description: '允许用户创建博客文章',
  },
  {
    code: 'blog.update',
    name: '更新博客',
    description: '允许用户更新博客文章',
  },
  {
    code: 'blog.delete',
    name: '删除博客',
    description: '允许用户删除博客文章',
  },
  {
    code: 'blog.export',
    name: '导出博客',
    description: '允许用户导出博客文章',
  },
  {
    code: 'tag.read',
    name: '查看标签',
    description: '允许用户查看标签',
  },
  {
    code: 'tag.create',
    name: '创建标签',
    description: '允许用户创建标签',
  },
  {
    code: 'tag.update',
    name: '更新标签',
    description: '允许用户更新标签',
  },
  {
    code: 'tag.delete',
    name: '删除标签',
    description: '允许用户删除标签',
  },
  {
    code: 'user.read',
    name: '查看用户',
    description: '允许用户查看用户信息',
  },
  {
    code: 'user.create',
    name: '创建用户',
    description: '允许用户创建用户',
  },
  {
    code: 'user.update',
    name: '更新用户',
    description: '允许用户更新用户',
  },
  {
    code: 'user.delete',
    name: '删除用户',
    description: '允许用户删除用户',
  },
  {
    code: 'role.read',
    name: '查看角色',
    description: '允许用户查看角色信息',
  },
  {
    code: 'role.create',
    name: '创建角色',
    description: '允许用户创建角色',
  },
  {
    code: 'role.update',
    name: '更新角色',
    description: '允许用户更新角色',
  },
  {
    code: 'role.delete',
    name: '删除角色',
    description: '允许用户删除角色',
  },
];

async function initPermissions() {
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, description: p.description },
      create: { code: p.code, name: p.name, description: p.description },
    });
  }
}

async function initRoles() {
  // 先保证角色存在
  await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '管理员', description: '拥有所有权限的用户' },
    create: {
      code: 'admin',
      name: '管理员',
      description: '拥有所有权限的用户',
    },
  });

  // 再绑定权限（connect 用唯一字段 code）
  await prisma.role.update({
    where: { code: 'admin' },
    data: {
      permissions: {
        set: [], // 确保幂等：每次跑都变成“只拥有这些权限”
        connect: permissions.map((p) => ({ code: p.code })),
      },
    },
  });
}

async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL as string;
  const adminPassword = process.env.ADMIN_PASSWORD as string;
  const adminNickname = process.env.ADMIN_NICKNAME as string;

  if (adminEmail && adminPassword && adminNickname) {
    const hashedPassword = await argon2.hash(adminPassword);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword, nickname: adminNickname },
      create: {
        email: adminEmail,
        password: hashedPassword,
        nickname: adminNickname,
      },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: { roles: { connect: [{ code: 'admin' }] } },
    });
  }
}

async function main() {
  await initPermissions();
  await initRoles();
  await initAdmin();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
