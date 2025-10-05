import { ApiProperty } from '@nestjs/swagger';

export class EventEntity {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  eventId?: string;

  @ApiProperty({ required: false })
  eventType?: string;

  @ApiProperty({ required: false })
  deviceId?: string;

  @ApiProperty({ required: false })
  deviceName?: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ required: false })
  personId?: string;

  @ApiProperty({ required: false })
  personName?: string;

  @ApiProperty({ required: false })
  cardNumber?: string;

  @ApiProperty({ required: false })
  doorId?: string;

  @ApiProperty({ required: false })
  doorName?: string;

  @ApiProperty({ required: false })
  accessResult?: string;

  @ApiProperty({ required: false })
  rawData?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [Object], required: false })
  images?: any[];
}