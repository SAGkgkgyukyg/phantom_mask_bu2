import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      let message = 'JWT 驗證失敗';
      
      if (info?.name === 'TokenExpiredError') {
        message = 'JWT token 已過期';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'JWT token 格式錯誤';
      } else if (info?.name === 'NotBeforeError') {
        message = 'JWT token 尚未生效';
      } else if (info?.message) {
        message = info.message;
      }
      
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
