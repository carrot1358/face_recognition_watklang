import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { EventsModule } from '../events/events.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    EventsModule,
    ImagesModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}