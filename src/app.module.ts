import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blogs/blogs.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TagModule } from './modules/tags/tags.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './guards/permission.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BlogModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    TagModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: PermissionsGuard }],
})
export class AppModule {}
