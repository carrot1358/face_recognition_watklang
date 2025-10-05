import { Controller, Get, Post, Body, Param, Query, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventEntity } from './entities/event.entity';

@ApiTags('events')
@Controller('api/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new access event' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: EventEntity })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createEventDto: CreateEventDto): Promise<EventEntity> {
    this.logger.log('Creating new event via API');
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all access events with pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of events to return (max 100)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of events to skip' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        events: { type: 'array', items: { $ref: '#/components/schemas/EventEntity' } },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  })
  async findAll(@Query() query: QueryEventsDto) {
    this.logger.log(`Querying events with params: limit=${query.limit}, offset=${query.offset}`);
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific access event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found', type: EventEntity })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EventEntity> {
    this.logger.log(`Finding event with ID: ${id}`);
    return this.eventsService.findOne(id);
  }
}