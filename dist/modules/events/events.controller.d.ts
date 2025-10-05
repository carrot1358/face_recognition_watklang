import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventEntity } from './entities/event.entity';
export declare class EventsController {
    private readonly eventsService;
    private readonly logger;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<EventEntity>;
    findAll(query: QueryEventsDto): Promise<{
        events: EventEntity[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    findOne(id: number): Promise<EventEntity>;
}
