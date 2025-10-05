import { Injectable, Logger } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { ImagesService } from '../images/images.service';
import { StorageService } from '../storage/storage.service';
import { WebhookPayloadDto, HikvisionEventDto } from './dto/webhook-payload.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private eventsService: EventsService,
    private imagesService: ImagesService,
    private storageService: StorageService,
  ) {}

  async processHikvisionWebhook(
    body: WebhookPayloadDto,
    files: Express.Multer.File[],
    headers: any,
  ): Promise<{ eventId: number; imageCount: number }> {
    let eventData: HikvisionEventDto = null;
    let savedImages = [];

    try {
      // Debug: Log raw request data
      this.logger.debug('Raw Request Headers:', JSON.stringify(headers, null, 2));
      this.logger.debug('Raw Request Body:', JSON.stringify(body, null, 2));
      this.logger.debug('Raw Request Files:', files ? files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      })) : 'No files');

      // Parse event_log if present
      if (body && body.event_log) {
        try {
          eventData = JSON.parse(body.event_log);
          this.logger.log('Received event data:', JSON.stringify(eventData, null, 2));
        } catch (e) {
          this.logger.error(`Failed to parse event_log: ${e.message}`);
          this.logger.warn(`Raw event_log: ${body.event_log}`);
        }
      } else if (body) {
        this.logger.log('Received body data:', JSON.stringify(body, null, 2));
      }

      // Map Hikvision data to our event format
      const accessControlEvent = eventData?.AccessControllerEvent;
      const mappedEventData = await this.eventsService.mapHikvisionData(eventData, accessControlEvent);

      // Create the access event record
      const accessEvent = await this.eventsService.create(mappedEventData);
      this.logger.log(`Saved event to database with ID: ${accessEvent.id}`);

      // Process uploaded files
      if (files && files.length > 0) {
        for (const [index, file] of files.entries()) {
          if (file.mimetype?.startsWith('image/')) {
            try {
              const savedImage = await this.imagesService.processUploadedFile(file, accessEvent.id, index);
              savedImages.push(savedImage);
              this.logger.log(`Processed image: ${savedImage.filename}`);
            } catch (error) {
              this.logger.error(`Failed to process image ${index}: ${error.message}`);
            }
          } else {
            // Handle text fields (like event_log)
            const content = file.buffer.toString('utf8');
            this.logger.log(`Field ${file.fieldname}: ${content.substring(0, 100)}...`);
          }
        }
      }

      this.logger.log(`Processing complete - Event ID: ${accessEvent.id}, Images: ${savedImages.length}`);

      return {
        eventId: accessEvent.id,
        imageCount: savedImages.length,
      };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`, error);
      throw error;
    }
  }

  async testMapping(body: any): Promise<{
    status: string;
    original: any;
    mapped: any;
    accessControlEvent: any;
  }> {
    try {
      const eventData = body;
      const accessControlEvent = eventData?.AccessControllerEvent;

      const mappedData = await this.eventsService.mapHikvisionData(eventData, accessControlEvent);

      this.logger.debug('Test mapping result:', JSON.stringify({
        original: eventData,
        mapped: mappedData,
        accessControlEvent: accessControlEvent,
      }, null, 2));

      return {
        status: 'success',
        original: eventData,
        mapped: mappedData,
        accessControlEvent: accessControlEvent,
      };
    } catch (error) {
      this.logger.error(`Test mapping error: ${error.message}`);
      throw error;
    }
  }
}