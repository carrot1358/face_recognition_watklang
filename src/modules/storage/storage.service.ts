import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { getMinioConfig, MinioConfig } from '../../config/app.config';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: MinioClient;
  private minioConfig: MinioConfig;

  constructor() {
    this.minioConfig = getMinioConfig();
    this.minioClient = new MinioClient({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.minioConfig.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.minioConfig.bucket, 'ap-southeast-1');
        this.logger.log(`Created MinIO bucket: ${this.minioConfig.bucket}`);
      } else {
        this.logger.log(`MinIO bucket exists: ${this.minioConfig.bucket}`);
      }

      // Set bucket policy for public read-only access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.minioConfig.bucket}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(this.minioConfig.bucket, JSON.stringify(policy));
      this.logger.log(`Set public read policy for bucket: ${this.minioConfig.bucket}`);
    } catch (error) {
      this.logger.error(`MinIO error: ${error.message}`);
      if (error.message.includes('policy')) {
        this.logger.warn('Cannot set bucket policy - images may not be publicly accessible');
      }
    }
  }

  async uploadFile(
    filename: string,
    buffer: Buffer,
    size: number,
    contentType: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(this.minioConfig.bucket, filename, buffer, size, {
        'Content-Type': contentType,
      });

      const protocol = this.minioConfig.useSSL ? 'https' : 'http';
      const portSuffix = (this.minioConfig.port === 80 || this.minioConfig.port === 443) ? '' : `:${this.minioConfig.port}`;
      const imageUrl = `${protocol}://${this.minioConfig.endPoint}${portSuffix}/${this.minioConfig.bucket}/${filename}`;

      this.logger.log(`Uploaded file to MinIO: ${filename}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`MinIO upload failed: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.minioConfig.bucket, filename);
      this.logger.log(`Deleted file from MinIO: ${filename}`);
    } catch (error) {
      this.logger.error(`MinIO delete failed: ${error.message}`);
      throw error;
    }
  }

  async checkConnection(): Promise<{ connected: boolean; bucket: string; endpoint: string }> {
    try {
      const exists = await this.minioClient.bucketExists(this.minioConfig.bucket);
      const protocol = this.minioConfig.useSSL ? 'https' : 'http';
      const endpoint = `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}`;

      return {
        connected: true,
        bucket: this.minioConfig.bucket,
        endpoint,
      };
    } catch (error) {
      this.logger.error(`MinIO connection check failed: ${error.message}`);
      return {
        connected: false,
        bucket: this.minioConfig.bucket,
        endpoint: `Error: ${error.message}`,
      };
    }
  }

  getMinioConfig(): MinioConfig {
    return this.minioConfig;
  }
}