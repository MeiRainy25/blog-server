import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        return (req?.cookies?.['refreshToken'] as string) ?? null;
      },
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return { ...payload };
  }
}
