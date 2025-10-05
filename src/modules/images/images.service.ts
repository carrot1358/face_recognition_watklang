import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageEntity } from './entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<ImageEntity> {
    try {
      this.logger.debug('Creating image record:', JSON.stringify(createImageDto, null, 2));

      const image = await this.prisma.accessImage.create({
        data: createImageDto,
      });

      this.logger.log(`Created image record with ID: ${image.id}`);
      return image as ImageEntity;
    } catch (error) {
      this.logger.error(`Failed to create image record: ${error.message}`);
      throw error;
    }
  }

  async processUploadedFile(
    file: Express.Multer.File,
    eventId: number,
    index: number = 0,
  ): Promise<ImageEntity> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
      const filename = `${timestamp}_${index}.${ext}`;

      this.logger.debug('Processing uploaded file:', JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        filename,
        eventId,
      }, null, 2));

      try {
        // Try to upload to MinIO first
        const imageUrl = await this.storageService.uploadFile(
          filename,
          file.buffer,
          file.size,
          file.mimetype,
        );

        const imageData: CreateImageDto = {
          eventId,
          filename,
          originalName: file.originalname || null,
          mimeType: file.mimetype,
          size: file.size,
          minioPath: `${this.storageService.getMinioConfig().bucket}/${filename}`,
          publicUrl: imageUrl,
        };

        const savedImage = await this.create(imageData);
        this.logger.log(`Successfully saved image to MinIO and DB: ${filename}`);
        this.logger.log(`Image URL: ${imageUrl}`);

        return savedImage;
      } catch (minioError) {
        this.logger.error(`MinIO upload failed: ${minioError.message}`);

        // Fallback to local storage
        const imgDir = 'data/imgs';
        fs.mkdirSync(imgDir, { recursive: true });
        const filepath = path.join(imgDir, filename);
        fs.writeFileSync(filepath, file.buffer);

        const localImageData: CreateImageDto = {
          eventId,
          filename,
          originalName: file.originalname || null,
          mimeType: file.mimetype,
          size: file.size,
          minioPath: `local/${filename}`,
          publicUrl: `/data/imgs/${filename}`,
        };

        const savedImage = await this.create(localImageData);
        this.logger.warn(`Fallback to local storage: ${filename}`);

        return savedImage;
      }
    } catch (error) {
      this.logger.error(`Failed to process uploaded file: ${error.message}`);
      throw error;
    }
  }

  async findByEventId(eventId: number): Promise<ImageEntity[]> {
    try {
      const images = await this.prisma.accessImage.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.debug(`Found ${images.length} images for event ${eventId}`);
      return images as ImageEntity[];
    } catch (error) {
      this.logger.error(`Failed to find images for event ${eventId}: ${error.message}`);
      throw error;
    }
  }

  async deleteByEventId(eventId: number): Promise<void> {
    try {
      const images = await this.findByEventId(eventId);

      // Delete files from storage
      for (const image of images) {
        try {
          if (image.minioPath.startsWith('local/')) {
            // Delete local file
            const filepath = path.join('data/imgs', image.filename);
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } else {
            // Delete from MinIO
            await this.storageService.deleteFile(image.filename);
          }
        } catch (fileError) {
          this.logger.error(`Failed to delete file ${image.filename}: ${fileError.message}`);
        }
      }

      // Delete database records
      await this.prisma.accessImage.deleteMany({
        where: { eventId },
      });

      this.logger.log(`Deleted ${images.length} images for event ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to delete images for event ${eventId}: ${error.message}`);
      throw error;
    }
  }
}