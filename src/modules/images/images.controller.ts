import { Controller, Get, Param, Delete, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { ImageEntity } from './entities/image.entity';

@ApiTags('images')
@Controller('api/images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(private readonly imagesService: ImagesService) {}

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all images for a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully', type: [ImageEntity] })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findByEventId(@Param('eventId', ParseIntPipe) eventId: number): Promise<ImageEntity[]> {
    this.logger.log(`Finding images for event: ${eventId}`);
    return this.imagesService.findByEventId(eventId);
  }

  @Delete('event/:eventId')
  @ApiOperation({ summary: 'Delete all images for a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Images deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteByEventId(@Param('eventId', ParseIntPipe) eventId: number): Promise<{ message: string }> {
    this.logger.log(`Deleting images for event: ${eventId}`);
    await this.imagesService.deleteByEventId(eventId);
    return { message: `Images for event ${eventId} deleted successfully` };
  }
}