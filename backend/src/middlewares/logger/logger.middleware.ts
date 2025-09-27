import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    console.log(
      `[${timestamp}] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // 記錄回應完成時間
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      console.log(
        `[${timestamp}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms\n`,
      );
    });

    next();
  }
}
