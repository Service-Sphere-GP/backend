import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => ChatModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
