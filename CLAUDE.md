# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **NestJS application** that processes **Hikvision camera webhook events** for access control systems. The application receives multipart form data containing access control events and images, stores them in PostgreSQL with Prisma ORM, and uploads images to MinIO object storage with local fallback.

## Core Architecture

### MVC Pattern Implementation
- **Controllers**: Handle HTTP requests and route to services (`/src/modules/*/controllers/`)
- **Services**: Business logic and data processing (`/src/modules/*/services/`)
- **DTOs**: Data validation and transformation (`/src/modules/*/dto/`)
- **Entities**: Database model representations (`/src/modules/*/entities/`)

### Module Structure
The application is organized into distinct functional modules:

- **WebhookModule**: Processes incoming Hikvision camera events via `POST /webhook/recieve/httpHosts`
- **EventsModule**: Manages access control events (CRUD operations)
- **ImagesModule**: Handles image metadata and storage operations
- **StorageModule**: MinIO client integration (global module)
- **HealthModule**: System health monitoring with database/MinIO connectivity checks
- **DatabaseModule**: Prisma service configuration (global module)

### Key Architectural Patterns

#### File Upload Handling
Uses `AnyFilesInterceptor()` to accept files from any field name (Hikvision cameras use varying field names). This is crucial for webhook compatibility.

#### Data Flow
1. Webhook receives multipart data → WebhookService
2. Parse `event_log` JSON string → EventsService mapping
3. Create AccessEvent record → ImagesService processes files
4. Upload to MinIO → Store metadata in AccessImage table

#### Global Services
- **PrismaService**: Database operations (auto-injected)
- **StorageService**: MinIO operations with bucket management
- **Winston Logger**: Structured logging across all modules

## Development Commands

### Database Operations
```bash
npm run db:generate    # Generate Prisma client (required after schema changes)
npm run db:migrate     # Deploy database migrations
npm run db:studio      # Open Prisma Studio GUI
```

### Development Workflow
```bash
npm run dev           # Development with hot reload
npm run start:debug   # Development with debugger
npm run build         # TypeScript compilation
npm run start:prod    # Production mode
```

### Testing
```bash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage
npm run test:e2e      # End-to-end tests
npm run test:debug    # Test debugging
```

### Code Quality
```bash
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
```

## Database Schema

### Core Models
- **AccessEvent**: Main event record with Hikvision device data
- **AccessImage**: Image metadata linked to events via foreign key

### Key Relationships
- One AccessEvent → Many AccessImages (cascade delete)
- Raw webhook data stored in `rawData` JSON field
- Timestamps managed automatically by Prisma

## Critical Implementation Details

### Webhook Compatibility
- **Must use `AnyFilesInterceptor()`** - Hikvision cameras send files with unpredictable field names
- Parse `event_log` field as JSON string containing event metadata
- Handle both text fields and binary image data in multipart requests

### Storage Architecture
- **Primary**: MinIO object storage with public read policies
- **Fallback**: Local filesystem in `data/imgs/` directory
- **Metadata**: Always stored in PostgreSQL regardless of storage method

### Configuration Management
- Environment-based config in `src/config/app.config.ts`
- Global ConfigModule for environment variables
- MinIO endpoint parsing handles various URL formats

### Error Handling
- Global exception filter in `src/common/filters/http-exception.filter.ts`
- Structured error responses with timestamps and request context
- Comprehensive logging for webhook processing failures

## Environment Setup

### Required Services
- **PostgreSQL**: Database with connection string in `DATABASE_URL`
- **MinIO**: Object storage (optional - has local fallback)

### Key Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_BUCKET=hikvision-images
```

## API Documentation

- **Swagger UI**: Available at `/api` when running
- **Health Checks**: `/health` for overall status, `/health/live` and `/health/ready` for Kubernetes
- **Main Webhook**: `POST /webhook/recieve/httpHosts` (accepts any multipart file fields)

## Docker Deployment

- **Multi-stage build**: Builder stage for compilation, production stage for runtime
- **Health checks**: Built into Docker containers
- **Service dependencies**: Proper health check coordination in docker-compose