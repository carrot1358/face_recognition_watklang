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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEventDto {
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Event ID from the device' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Type of the event' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "eventType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Device ID (MAC address or IP)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Device name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Person ID from access control' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "personId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Person name from access control' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "personName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Card number used for access' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "cardNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Door ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "doorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Door name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "doorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Access result (success/failed)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "accessResult", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Raw data from the webhook' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEventDto.prototype, "rawData", void 0);
//# sourceMappingURL=create-event.dto.js.map