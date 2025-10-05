# Hikvision Webhook API - NestJS Migration

## Migration Complete ✅

This project has been successfully migrated from Express.js to **NestJS** with a complete **MVC (Model-View-Controller)** architecture pattern.

## 🚀 Features

### Core Functionality
- **Webhook Processing**: Receives and processes Hikvision camera access control events
- **Image Storage**: MinIO object storage with local fallback
- **Database Operations**: PostgreSQL with Prisma ORM
- **API Endpoints**: RESTful API for querying events and images
- **Health Monitoring**: Comprehensive health checks for all services

### Architecture Improvements
- **MVC Pattern**: Complete separation of concerns
- **Dependency Injection**: Proper service management
- **Type Safety**: Full TypeScript implementation
- **Validation**: Input validation with class-validator
- **Error Handling**: Global exception filters
- **Logging**: Structured logging with Winston
- **Documentation**: Auto-generated Swagger API docs

## 📁 Project Structure

```
src/
├── main.ts                          # Application bootstrap
├── app.module.ts                    # Root module
├── config/                          # Configuration
│   ├── database.module.ts
│   ├── prisma.service.ts
│   └── app.config.ts
├── common/                          # Shared utilities
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       ├── logging.interceptor.ts
│       └── transform.interceptor.ts
└── modules/
    ├── webhook/                     # Webhook handling
    │   ├── controllers/
    │   ├── services/
    │   ├── dto/
    │   └── webhook.module.ts
    ├── events/                      # Access events
    │   ├── controllers/
    │   ├── services/
    │   ├── entities/
    │   ├── dto/
    │   └── events.module.ts
    ├── images/                      # Image management
    │   ├── controllers/
    │   ├── services/
    │   ├── entities/
    │   ├── dto/
    │   └── images.module.ts
    ├── health/                      # Health checks
    │   ├── controllers/
    │   ├── services/
    │   └── health.module.ts
    └── storage/                     # MinIO storage
        ├── services/
        └── storage.module.ts
```

## 🛠️ Development

### Prerequisites
- Node.js 20+
- PostgreSQL
- MinIO (optional, has local fallback)

### Installation
```bash
npm install
npm run db:generate
npm run build
```

### Scripts
```bash
# Development
npm run dev          # Start in watch mode
npm run start:debug  # Start with debugging

# Production
npm run build        # Build application
npm run start:prod   # Start production build

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npm run test:cov     # Run with coverage
```

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.yml up -d
```

## 📖 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/health

## 🔗 API Endpoints

### Webhook
- `POST /webhook/recieve/httpHosts` - Receive Hikvision events
- `POST /webhook/test/mapping` - Test data mapping
- `POST /webhook/minio/test` - Test MinIO connection

### Events
- `GET /api/events` - List access events (with pagination)
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event

### Images
- `GET /api/images/event/:eventId` - Get images for event
- `DELETE /api/images/event/:eventId` - Delete images for event

### Health
- `GET /health` - Overall health status
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## 🔧 Configuration

Environment variables (see `.env.example`):

```bash
# Application
PORT=8080
NODE_ENV=production
CORS_ORIGIN=*

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hikvision_db

# MinIO Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_BUCKET=hikvision-images

# Security
ALLOW_IPS=192.168.1.201,192.168.1.202
```

## 🎯 Migration Benefits

### Before (Express.js)
- ❌ Monolithic single file (613 lines)
- ❌ No separation of concerns
- ❌ Mixed business logic with routing
- ❌ No proper error handling
- ❌ No validation
- ❌ Hard to test and maintain

### After (NestJS)
- ✅ Modular MVC architecture
- ✅ Dependency injection
- ✅ Type safety throughout
- ✅ Global error handling
- ✅ Input validation
- ✅ Structured logging
- ✅ Auto-generated documentation
- ✅ Health monitoring
- ✅ Easy to test and extend

## 📊 Health Monitoring

The application includes comprehensive health checks:
- Database connectivity and response times
- MinIO storage availability
- Service readiness and liveness probes
- Kubernetes-ready health endpoints

## 🔒 Security Features

- Input validation and sanitization
- CORS configuration
- IP allowlist support
- Structured error responses
- Request/response logging

## 🚀 Production Ready

- Multi-stage Docker build
- Health checks with automatic restarts
- Graceful shutdown handling
- Performance optimizations
- Production logging configuration