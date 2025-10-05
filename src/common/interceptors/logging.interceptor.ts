import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;

    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

    if (body && Object.keys(body).length > 0) {
      // Don't log sensitive data like files, but log structure
      const sanitizedBody = this.sanitizeRequestBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const contentLength = response.get('content-length') || 0;

          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms - ${contentLength} bytes`,
          );

          // Log response data for debugging (optional and can be filtered)
          if (process.env.NODE_ENV === 'development' && data) {
            this.logger.debug(`Response Data: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Error Response: ${method} ${url} - ${error.status || 500} - ${duration}ms`,
            error.message,
          );
        },
      }),
    );
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };

    // Remove or truncate large fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = `${sanitized[key].substring(0, 100)}... [truncated]`;
      }
    });

    return sanitized;
  }
}