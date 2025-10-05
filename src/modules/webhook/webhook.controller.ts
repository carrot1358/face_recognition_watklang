import {
  Controller,
  Post,
  Body,
  Logger,
  Req,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StorageService } from '../storage/storage.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly storageService: StorageService,
  ) {}

  @Post('recieve/httpHosts')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Receive Hikvision webhook events' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async receiveWebhook(
    @Body() body: WebhookPayloadDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ): Promise<void> {
    this.logger.log('Received Hikvision webhook');

    try {
      const result = await this.webhookService.processHikvisionWebhook(
        body,
        files,
        req.headers,
      );

      this.logger.log(`Webhook processed successfully: Event ID ${result.eventId}, ${result.imageCount} images`);
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  @Post('recieve/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear endpoint for testing' })
  @ApiResponse({ status: 200, description: 'Clear successful' })
  async clear(): Promise<void> {
    this.logger.log('Clear endpoint called');
  }

  @Post('test/mapping')
  @ApiOperation({ summary: 'Test data mapping from Hikvision format' })
  @ApiResponse({ status: 200, description: 'Mapping test successful' })
  async testMapping(@Body() body: any) {
    this.logger.log('Testing data mapping');
    return this.webhookService.testMapping(body);
  }

  @Post('minio/test')
  @ApiOperation({ summary: 'Test MinIO connection' })
  @ApiResponse({ status: 200, description: 'MinIO test successful' })
  async testMinio() {
    this.logger.log('Testing MinIO connection');

    try {
      const result = await this.storageService.checkConnection();
      return {
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`MinIO test error: ${error.message}`);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('minio/upload-test')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Test MinIO file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Upload test successful' })
  async testUpload(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log('Testing MinIO upload');

    if (!files || files.length === 0) {
      return { error: 'No image file provided' };
    }

    const file = files[0];

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
      const filename = `test_${timestamp}.${ext}`;

      const imageUrl = await this.storageService.uploadFile(
        filename,
        file.buffer,
        file.size,
        file.mimetype,
      );

      this.logger.log(`Test upload successful: ${filename}`);

      return {
        status: 'success',
        filename,
        size: file.size,
        mimetype: file.mimetype,
        url: imageUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Test upload failed: ${error.message}`);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}