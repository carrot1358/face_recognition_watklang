import { EventsService } from '../events/events.service';
import { ImagesService } from '../images/images.service';
import { StorageService } from '../storage/storage.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
export declare class WebhookService {
    private eventsService;
    private imagesService;
    private storageService;
    private readonly logger;
    constructor(eventsService: EventsService, imagesService: ImagesService, storageService: StorageService);
    processHikvisionWebhook(body: WebhookPayloadDto, files: Express.Multer.File[], headers: any): Promise<{
        eventId: number;
        imageCount: number;
    }>;
    testMapping(body: any): Promise<{
        status: string;
        original: any;
        mapped: any;
        accessControlEvent: any;
    }>;
}
