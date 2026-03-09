import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class AccessJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      // Token过期
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'AccessToken 已过期',
          code: 'ACCESS_TOKEN_EXPIRED',
        });
      }

      // 其他情况
      throw new UnauthorizedException({
        message: '未授权或 AccessToken 无效',
        code: 'ACCESS_TOKEN_INVALID',
      });
    }

    return user as TUser;
  }
}
