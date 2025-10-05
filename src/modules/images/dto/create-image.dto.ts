import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ description: 'Event ID this image belongs to' })
  @IsInt()
  eventId: number;

  @ApiProperty({ description: 'Filename of the image' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'Original filename from upload', required: false })
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiProperty({ description: 'MIME type of the image' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'Size of the image in bytes' })
  @IsInt()
  size: number;

  @ApiProperty({ description: 'MinIO storage path' })
  @IsString()
  minioPath: string;

  @ApiProperty({ description: 'Public URL to access the image' })
  @IsString()
  publicUrl: string;
}