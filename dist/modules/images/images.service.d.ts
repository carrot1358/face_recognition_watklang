import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageEntity } from './entities/image.entity';
export declare class ImagesService {
    private prisma;
    private storageService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService);
    create(createImageDto: CreateImageDto): Promise<ImageEntity>;
    processUploadedFile(file: Express.Multer.File, eventId: number, index?: number): Promise<ImageEntity>;
    findByEventId(eventId: number): Promise<ImageEntity[]>;
    deleteByEventId(eventId: number): Promise<void>;
}
