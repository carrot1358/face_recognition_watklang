import { IsOptional, IsInt, Min, Max, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryEventsDto {
  @ApiProperty({
    description: 'Number of events to return',
    default: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Number of events to skip',
    default: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Filter by person name (partial match)',
    required: false,
  })
  @IsOptional()
  @IsString()
  personName?: string;

  @ApiProperty({
    description: 'Filter by person ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({
    description: 'Filter by device name',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({
    description: 'Filter by access result (success, failed)',
    required: false,
  })
  @IsOptional()
  @IsString()
  accessResult?: string;

  @ApiProperty({
    description: 'Filter events from this date (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'Filter events to this date (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Only return events with images',
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  withImages?: boolean = false;
}