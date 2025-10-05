import { IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ required: false, description: 'Event ID from the device' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ required: false, description: 'Type of the event' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiProperty({ required: false, description: 'Device ID (MAC address or IP)' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ required: false, description: 'Device name' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ required: false, description: 'Person ID from access control' })
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({ required: false, description: 'Person name from access control' })
  @IsOptional()
  @IsString()
  personName?: string;

  @ApiProperty({ required: false, description: 'Card number used for access' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({ required: false, description: 'Door ID' })
  @IsOptional()
  @IsString()
  doorId?: string;

  @ApiProperty({ required: false, description: 'Door name' })
  @IsOptional()
  @IsString()
  doorName?: string;

  @ApiProperty({ required: false, description: 'Access result (success/failed)' })
  @IsOptional()
  @IsString()
  accessResult?: string;

  @ApiProperty({ required: false, description: 'Raw data from the webhook' })
  @IsOptional()
  @IsObject()
  rawData?: any;
}