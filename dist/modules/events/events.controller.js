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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const query_events_dto_1 = require("./dto/query-events.dto");
const event_entity_1 = require("./entities/event.entity");
let EventsController = EventsController_1 = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
        this.logger = new common_1.Logger(EventsController_1.name);
    }
    async create(createEventDto) {
        this.logger.log('Creating new event via API');
        return this.eventsService.create(createEventDto);
    }
    async findAll(query) {
        this.logger.log(`Querying events with params: limit=${query.limit}, offset=${query.offset}`);
        return this.eventsService.findAll(query);
    }
    async findOne(id) {
        this.logger.log(`Finding event with ID: ${id}`);
        return this.eventsService.findOne(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new access event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event created successfully', type: event_entity_1.EventEntity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all access events with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of events to return (max 100)' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Number of events to skip' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_events_dto_1.QueryEventsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific access event by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event found', type: event_entity_1.EventEntity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
exports.EventsController = EventsController = EventsController_1 = __decorate([
    (0, swagger_1.ApiTags)('events'),
    (0, common_1.Controller)('api/events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map