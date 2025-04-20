import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Notification } from './schemas/notification.schema';

@Controller('notifications')
@UseGuards(BlacklistedJwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @CurrentUser() user: any,
  ): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(user.user_id);
  }

  @Get('unread')
  async getUnreadNotifications(
    @CurrentUser() user: any,
  ): Promise<Notification[]> {
    return this.notificationService.getUserUnreadNotifications(user.user_id);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Notification> {
    try {
      const notification =
        await this.notificationService.markNotificationAsRead(id);

      if (notification.recipient.toString() !== user.user_id) {
        throw new NotFoundException('Notification not found');
      }

      return notification;
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: any): Promise<{ message: string }> {
    await this.notificationService.markAllNotificationsAsRead(user.user_id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    try {
      const notifications = await this.notificationService.getUserNotifications(
        user.user_id,
      );
      const notification = notifications.find((n) => n._id.toString() === id);

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.notificationService.deleteNotification(id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }
}
