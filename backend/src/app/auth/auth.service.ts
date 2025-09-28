import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';

interface User {
  id: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 驗證用戶憑證
   * @param username 用戶名
   * @param password 密碼
   * @returns 用戶資訊或 null
   */
  private async validateUser(username: string, password: string): Promise<User | null> {
    // 從環境變數讀取帳號密碼配置
    const normalUsername = this.configService.get<string>('NORMAL_USER_USERNAME');
    const normalPassword = this.configService.get<string>('NORMAL_USER_PASSWORD');
    const adminUsername = this.configService.get<string>('ADMIN_USER_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_USER_PASSWORD');

    // 驗證普通使用者
    if (username === normalUsername && normalPassword) {
      const isValidPassword = await bcrypt.compare(password, normalPassword);
      if (isValidPassword) {
        return {
          id: 'user-001',
          username: normalUsername,
          role: 'user',
        };
      }
    }

    // 驗證管理者
    if (username === adminUsername && adminPassword) {
      const isValidPassword = await bcrypt.compare(password, adminPassword);
      if (isValidPassword) {
        return {
          id: 'admin-001',
          username: adminUsername,
          role: 'admin',
        };
      }
    }

    return null;
  }

  /**
   * 用戶登入
   * @param loginDto 登入資訊
   * @returns JWT token 和用戶資訊
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { userName: username, password } = loginDto;

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用戶名或密碼錯誤');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken: accessToken,
      tokenType: 'Bearer',
      expiresIn: 24 * 60 * 60, // 24 小時，與 auth.module.ts 保持一致
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * 驗證 JWT token
   * @param token JWT token
   * @returns 解碼後的用戶資訊
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
