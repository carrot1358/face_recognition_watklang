import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto): Promise<EventEntity> {
    try {
      this.logger.debug('Creating new event:', JSON.stringify(createEventDto, null, 2));

      const event = await this.prisma.accessEvent.create({
        data: createEventDto,
        include: {
          images: true,
        },
      });

      this.logger.log(`Created event with ID: ${event.id}`);
      return event as EventEntity;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`);
      throw error;
    }
  }

  async findAll(queryDto: QueryEventsDto) {
    try {
      this.logger.debug('Querying events:', JSON.stringify(queryDto, null, 2));

      // Build where clause with filters
      const whereClause: any = {};

      if (queryDto.personName) {
        whereClause.personName = {
          contains: queryDto.personName,
          mode: 'insensitive',
        };
      }

      if (queryDto.personId) {
        whereClause.personId = queryDto.personId;
      }

      if (queryDto.deviceName) {
        whereClause.deviceName = {
          contains: queryDto.deviceName,
          mode: 'insensitive',
        };
      }

      if (queryDto.accessResult) {
        whereClause.accessResult = queryDto.accessResult;
      }

      if (queryDto.fromDate || queryDto.toDate) {
        whereClause.createdAt = {};
        if (queryDto.fromDate) {
          whereClause.createdAt.gte = new Date(queryDto.fromDate);
        }
        if (queryDto.toDate) {
          whereClause.createdAt.lte = new Date(queryDto.toDate);
        }
      }

      if (queryDto.withImages) {
        whereClause.images = {
          some: {},
        };
      }

      const [events, total] = await Promise.all([
        this.prisma.accessEvent.findMany({
          where: whereClause,
          include: {
            images: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: queryDto.limit,
          skip: queryDto.offset,
        }),
        this.prisma.accessEvent.count({
          where: whereClause,
        }),
      ]);

      const response = {
        events: events as EventEntity[],
        pagination: {
          total,
          limit: queryDto.limit,
          offset: queryDto.offset,
          hasMore: queryDto.offset + queryDto.limit < total,
        },
      };

      this.logger.debug('Events query result:', JSON.stringify({
        eventCount: events.length,
        total,
        pagination: response.pagination,
      }, null, 2));

      return response;
    } catch (error) {
      this.logger.error(`Failed to query events: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<EventEntity> {
    try {
      this.logger.debug(`Finding event with ID: ${id}`);

      const event = await this.prisma.accessEvent.findUnique({
        where: { id },
        include: {
          images: true,
        },
      });

      if (!event) {
        this.logger.debug(`Event not found: ${id}`);
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      this.logger.debug('Found event:', JSON.stringify({
        eventId: event.id,
        imageCount: event.images?.length || 0,
      }, null, 2));

      return event as EventEntity;
    } catch (error) {
      this.logger.error(`Failed to find event: ${error.message}`);
      throw error;
    }
  }

  async mapHikvisionData(eventData: any, accessControlEvent: any): Promise<CreateEventDto> {
    const mappedData: CreateEventDto = {
      eventId: eventData?.serialNo?.toString() || accessControlEvent?.serialNo?.toString() || null,
      eventType: eventData?.eventType || null,
      deviceId: eventData?.macAddress || eventData?.ipAddress || null,
      deviceName: accessControlEvent?.deviceName || 'Access Controller',
      personId: accessControlEvent?.employeeNoString || null,
      personName: accessControlEvent?.name || null,
      cardNumber: accessControlEvent?.cardNo || null,
      doorId: eventData?.channelID?.toString() || null,
      doorName: null,
      accessResult: accessControlEvent?.statusValue === 0 ? 'success' : 'failed',
      rawData: eventData || {},
    };

    this.logger.debug('Mapped Hikvision data:', JSON.stringify({
      original: eventData,
      mapped: mappedData,
      accessControlEvent: accessControlEvent,
    }, null, 2));

    return mappedData;
  }
}