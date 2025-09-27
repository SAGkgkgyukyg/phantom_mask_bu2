import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'phantom-mask-secret-key-2024',
    });
  }

  async validate(payload: any) {
    // 檢查 payload 的必要欄位
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('JWT payload 缺少必要資訊');
    }

    // 檢查 token 是否過期 (雖然 passport-jwt 會自動檢查，但這裡加上額外驗證)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      throw new UnauthorizedException('JWT token 已過期');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
