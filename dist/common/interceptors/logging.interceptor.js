"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { method, url, body, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const ip = request.ip || request.connection.remoteAddress;
        const startTime = Date.now();
        this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
        if (body && Object.keys(body).length > 0) {
            const sanitizedBody = this.sanitizeRequestBody(body);
            this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const duration = Date.now() - startTime;
                const contentLength = response.get('content-length') || 0;
                this.logger.log(`Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms - ${contentLength} bytes`);
                if (process.env.NODE_ENV === 'development' && data) {
                    this.logger.debug(`Response Data: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
                }
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(`Error Response: ${method} ${url} - ${error.status || 500} - ${duration}ms`, error.message);
            },
        }));
    }
    sanitizeRequestBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }
        const sanitized = { ...body };
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
                sanitized[key] = `${sanitized[key].substring(0, 100)}... [truncated]`;
            }
        });
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map