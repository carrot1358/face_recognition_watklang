import { ImagesService } from './images.service';
import { ImageEntity } from './entities/image.entity';
export declare class ImagesController {
    private readonly imagesService;
    private readonly logger;
    constructor(imagesService: ImagesService);
    findByEventId(eventId: number): Promise<ImageEntity[]>;
    deleteByEventId(eventId: number): Promise<{
        message: string;
    }>;
}
