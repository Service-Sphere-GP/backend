import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(notificationData: {
    title: string;
    message: string;
    recipient: string | Types.ObjectId;
    type: 'booking' | 'status_change' | 'feedback' | 'system';
    booking_id?: string | Types.ObjectId;
    service_id?: string | Types.ObjectId;
  }): Promise<Notification> {
    try {
      const recipientId =
        typeof notificationData.recipient === 'string'
          ? new Types.ObjectId(notificationData.recipient)
          : notificationData.recipient;

      const bookingId = notificationData.booking_id
        ? typeof notificationData.booking_id === 'string'
          ? new Types.ObjectId(notificationData.booking_id)
          : notificationData.booking_id
        : undefined;

      const serviceId = notificationData.service_id
        ? typeof notificationData.service_id === 'string'
          ? new Types.ObjectId(notificationData.service_id)
          : notificationData.service_id
        : undefined;

      const notification = new this.notificationModel({
        title: notificationData.title,
        message: notificationData.message,
        recipient: recipientId,
        type: notificationData.type,
        booking_id: bookingId,
        service_id: serviceId,
        read: false,
      });

      const savedNotification = await notification.save();
      this.logger.log(
        `Created notification ${savedNotification._id} for user ${recipientId}`,
      );
      return savedNotification;
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const recipientId = new Types.ObjectId(userId);
      this.logger.log(`Fetching notifications for user: ${userId}`);

      return this.notificationModel
        .find({ recipient: recipientId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const recipientId = new Types.ObjectId(userId);

      return this.notificationModel
        .find({ recipient: recipientId, read: false })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get unread notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await this.notificationModel
        .findByIdAndUpdate(notificationId, { read: true }, { new: true })
        .exec();

      if (!notification) {
        throw new Error(`Notification with ID ${notificationId} not found`);
      }

      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to mark notification ${notificationId} as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const recipientId = new Types.ObjectId(userId);

      await this.notificationModel
        .updateMany({ recipient: recipientId, read: false }, { read: true })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const result = await this.notificationModel
        .findByIdAndDelete(notificationId)
        .exec();
      if (!result) {
        throw new Error(`Notification with ID ${notificationId} not found`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
