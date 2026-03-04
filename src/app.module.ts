import { Module } from '@nestjs/common';
import { BlogModule } from './blogs/blogs.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TagModule } from './tags/tags.module';

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
  providers: [],
})
export class AppModule {}
