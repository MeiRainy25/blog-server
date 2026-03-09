import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from 'lib/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter } satisfies Prisma.PrismaClientOptions);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
