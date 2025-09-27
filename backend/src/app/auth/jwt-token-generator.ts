import { JwtService } from '@nestjs/jwt';

/**
 * JWT Token 產生工具
 * 用於開發測試時產生有效的 JWT token
 */
export class JwtTokenGenerator {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET || 'phantom-mask-secret-key-2024',
      signOptions: { expiresIn: '24h' },
    });
  }

  /**
   * 產生測試用的 JWT token
   * @param payload 包含用戶資訊的 payload
   * @returns JWT token 字串
   */
  generateToken(payload: { sub: string; username: string }): string {
    return this.jwtService.sign(payload);
  }

  /**
   * 產生預設的測試 token
   * @returns 包含測試用戶資訊的 JWT token
   */
  generateDefaultTestToken(): string {
    return this.generateToken({
      sub: 'test-user-id-123',
      username: 'testuser',
    });
  }
}

// 使用範例：
// const generator = new JwtTokenGenerator();
// const token = generator.generateDefaultTestToken();
// console.log('Test JWT Token:', token);
