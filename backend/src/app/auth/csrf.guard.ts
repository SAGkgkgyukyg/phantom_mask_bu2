import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * CSRF 防護 Guard
 * 檢查請求來源和 Referer 標頭以防止 CSRF 攻擊
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 只對狀態改變的方法（POST、PUT、DELETE、PATCH）進行檢查
    const method = request.method.toUpperCase();
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return true;
    }

    // 檢查 Content-Type，API 請求應該使用 application/json
    const contentType = request.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return true; // JSON 請求不容易被 CSRF 攻擊利用
    }

    // 檢查自定義 CSRF 標頭
    const csrfToken = request.get('X-CSRF-Token');
    const expectedToken = request.get('X-Requested-With');
    
    // 如果有 X-Requested-With 標頭（AJAX 請求），允許通過
    if (expectedToken === 'XMLHttpRequest') {
      return true;
    }

    // 檢查 Referer 標頭
    const referer = request.get('Referer');
    const origin = request.get('Origin');
    const host = request.get('Host');

    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        throw new UnauthorizedException('CSRF protection: Invalid origin');
      }
    } else if (referer) {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        throw new UnauthorizedException('CSRF protection: Invalid referer');
      }
    } else {
      // 沒有 Origin 或 Referer，拒絕請求
      throw new UnauthorizedException('CSRF protection: Missing origin/referer header');
    }

    return true;
  }
}