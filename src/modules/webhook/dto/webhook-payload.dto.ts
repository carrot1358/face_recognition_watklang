import { IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPayloadDto {
  @ApiProperty({ required: false, description: 'Event log data as JSON string' })
  @IsOptional()
  @IsString()
  event_log?: string;

  // Any additional form fields
  [key: string]: any;
}

export class HikvisionEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  serialNo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  eventType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  macAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  channelID?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  AccessControllerEvent?: {
    serialNo?: number;
    deviceName?: string;
    employeeNoString?: string;
    name?: string;
    cardNo?: string;
    statusValue?: number;
  };
}