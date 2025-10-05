import { PrismaService } from '../../config/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventEntity } from './entities/event.entity';
export declare class EventsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createEventDto: CreateEventDto): Promise<EventEntity>;
    findAll(queryDto: QueryEventsDto): Promise<{
        events: EventEntity[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    findOne(id: number): Promise<EventEntity>;
    mapHikvisionData(eventData: any, accessControlEvent: any): Promise<CreateEventDto>;
}
