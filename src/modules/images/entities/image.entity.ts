import { ApiProperty } from '@nestjs/swagger';

export class ImageEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  eventId: number;

  @ApiProperty()
  filename: string;

  @ApiProperty({ required: false })
  originalName?: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  minioPath: string;

  @ApiProperty()
  publicUrl: string;

  @ApiProperty()
  createdAt: Date;
}