import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // 校验用户
  async validateUser(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isValid = await verify(user.password, password);
    return isValid ? user : null;
  }

  // 校验邮箱是否存在
  async validateEmail(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    return !!user;
  }

  // 注册Token
  async getTokens(userId: string, email: string, nickname: string) {
    const payload = { sub: userId, email, nickname };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 更新refreshToken
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    if (refreshToken) {
      // 更新refreshtoken
      const hashed = await argon2.hash(refreshToken);
      await this.usersService.setRefreshTokenHash(userId, hashed);
    } else {
      // 置空token
      await this.usersService.clearRefreshToken(userId);
    }
  }

  // 刷新accessToken
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.getUserById(userId);

    if (!user || !user.refreshToken) {
      this.logger.warn(`刷新Token失败, 用户无有效Token: ${userId}`);
      throw new ForbiddenException('Access Denied');
    }

    // 检查refreshtoken是否匹配
    const isMatch = await argon2.verify(user.refreshToken, refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Access Denied');
    }

    // 刷新accessToken
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email: user.email, nickname: user.nickname },
      {
        expiresIn: '15m',
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );
    this.logger.log(`刷新AccessToken成功: ${userId}`);
    return { accessToken };
  }

  // 登陆
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    // 生成AccessToken和refreshToken
    const tokens = await this.getTokens(user.id, user.email, user.nickname);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`用户登录成功: ${user.id}`);
    return tokens;
  }

  // 注册
  async register(dto: RegisterDto) {
    // 校验邮箱是否已存在
    const isExistEmail = await this.validateEmail(dto.email);
    if (isExistEmail) {
      throw new UnauthorizedException('Email already exists');
    }
    // 加密密码
    const hashedPassword = await hash(dto.password);
    const user = await this.usersService.createUser({
      email: dto.email,
      password: hashedPassword,
      nickname: dto.nickname ?? `New User ${dayjs().toString().slice(0, 8)}`,
    });

    // 注册后生成accessToken和refreshToken, 直接登录
    const tokens = await this.getTokens(user.id, user.email, user.nickname);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`用户注册成功: ${user.id}`);
    return tokens;
  }

  // 登出
  async logout(userId: string) {
    await this.updateRefreshToken(userId, null);
    this.logger.log(`用户登出成功: ${userId}`);
  }
}
