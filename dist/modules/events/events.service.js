"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let EventsService = EventsService_1 = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async create(createEventDto) {
        try {
            this.logger.debug('Creating new event:', JSON.stringify(createEventDto, null, 2));
            const event = await this.prisma.accessEvent.create({
                data: createEventDto,
                include: {
                    images: true,
                },
            });
            this.logger.log(`Created event with ID: ${event.id}`);
            return event;
        }
        catch (error) {
            this.logger.error(`Failed to create event: ${error.message}`);
            throw error;
        }
    }
    async findAll(queryDto) {
        try {
            this.logger.debug('Querying events:', JSON.stringify(queryDto, null, 2));
            const [events, total] = await Promise.all([
                this.prisma.accessEvent.findMany({
                    include: {
                        images: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: queryDto.limit,
                    skip: queryDto.offset,
                }),
                this.prisma.accessEvent.count(),
            ]);
            const response = {
                events: events,
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
        }
        catch (error) {
            this.logger.error(`Failed to query events: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
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
                throw new common_1.NotFoundException(`Event with ID ${id} not found`);
            }
            this.logger.debug('Found event:', JSON.stringify({
                eventId: event.id,
                imageCount: event.images?.length || 0,
            }, null, 2));
            return event;
        }
        catch (error) {
            this.logger.error(`Failed to find event: ${error.message}`);
            throw error;
        }
    }
    async mapHikvisionData(eventData, accessControlEvent) {
        const mappedData = {
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map