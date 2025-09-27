import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 驗證用戶憑證
   * @param username 用戶名
   * @param password 密碼
   * @returns 用戶資訊或 null
   */
  private async validateUser(username: string, password: string): Promise<any> {
    // 這裡使用簡單的硬編碼驗證，實際應用中應該查詢資料庫
    const validUsers = [
      { id: 'user-001', username: 'admin', password: 'admin123' },
      { id: 'user-002', username: 'testuser', password: 'password123' },
      { id: 'user-003', username: 'pharmacist', password: 'pharma2024' },
    ];

    const user = validUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      const { password, ...result } = user;
      return result;
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
