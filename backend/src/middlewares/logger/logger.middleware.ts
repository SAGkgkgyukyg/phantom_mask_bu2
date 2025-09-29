import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // 敏感資料的 key 列表（不區分大小寫）
  private readonly sensitiveKeys = [
    'password',
    'token',
    'authorization',
    'auth',
    'secret',
    'key',
    'credential',
    'session',
    'cookie',
    'csrf-token',
    'x-csrf-token',
    'captcha',
    'ssn',
    'credit',
    'card',
    'cvv',
    'pin'
  ];

  // 敏感的 URL 路徑模式
  private readonly sensitiveUrlPatterns = [
    /\/auth\/login/,
    /\/auth\/register/,
    /\/auth\/password/,
    /\/api\/.*\/secret/,
    /\/admin\/credentials/
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 檢查是否為敏感操作
    const isSensitiveUrl = this.sensitiveUrlPatterns.some(pattern => 
      pattern.test(originalUrl)
    );

    // 過濾敏感標頭
    const safeHeaders = this.filterSensitiveData(headers);

    // 記錄請求（不記錄 body 內容以避免敏感資料）
    if (isSensitiveUrl) {
      console.log(
        `[${timestamp}] ${method} ${originalUrl} - IP: ${ip} - [SENSITIVE_OPERATION]`,
      );
    } else {
      console.log(
        `[${timestamp}] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
      );
      
      // 只有在非敏感操作時才記錄過濾後的標頭（用於除錯）
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${timestamp}] Headers:`, JSON.stringify(safeHeaders, null, 2));
      }
    }

    // 記錄回應完成時間
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      
      if (isSensitiveUrl) {
        console.log(
          `[${timestamp}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - [SENSITIVE_OPERATION]\n`,
        );
      } else {
        console.log(
          `[${timestamp}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms\n`,
        );
      }
    });

    next();
  }

  /**
   * 過濾物件中的敏感資料
   * @param data 要過濾的物件
   * @returns 已過濾敏感資料的物件
   */
  private filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const filtered = { ...data };

    for (const key of Object.keys(filtered)) {
      const keyLower = key.toLowerCase();
      
      // 檢查是否包含敏感關鍵字
      const isSensitive = this.sensitiveKeys.some(sensitiveKey => 
        keyLower.includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        filtered[key] = '[REDACTED]';
      } else if (typeof filtered[key] === 'object') {
        // 遞迴過濾嵌套物件
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    }

    return filtered;
  }
}
