import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage } from './schemas/chat-message.schema';
import { ServiceBookings } from '../service-bookings/schemas/service-booking.schema';
import { User } from '../users/schemas/user.schema';
import { Service } from '../services/schemas/service.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async validateUserAccess(
    userId: string | Types.ObjectId,
    bookingId: string | Types.ObjectId,
  ): Promise<{ booking: ServiceBookings; providerId: Types.ObjectId }> {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate('service_id')
      .lean();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new ForbiddenException('Chat is closed for this booking.');
    }

    const service = booking.service_id as unknown as Service;
    if (!service || !service.service_provider) {
      throw new InternalServerErrorException(
        'Could not determine service provider for this booking.',
      );
    }
    const providerId = service.service_provider;

    const userIdObj =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const customerId = booking.customer_id;

    if (!userIdObj.equals(customerId) && !userIdObj.equals(providerId)) {
      throw new ForbiddenException(
        'You are not authorized to access this chat.',
      );
    }

    return { booking, providerId };
  }

  async createMessage(
    senderId: string | Types.ObjectId,
    bookingId: string | Types.ObjectId,
    content: string,
  ): Promise<ChatMessage> {
    const { booking, providerId } = await this.validateUserAccess(
      senderId,
      bookingId,
    );

    const senderIdObj =
      typeof senderId === 'string' ? new Types.ObjectId(senderId) : senderId;
    let receiverId: Types.ObjectId;

    if (senderIdObj.equals(booking.customer_id)) {
      receiverId = providerId;
    } else if (senderIdObj.equals(providerId)) {
      receiverId = booking.customer_id;
    } else {
      throw new ForbiddenException('Sender is not part of this booking.');
    }

    const newMessage = new this.chatMessageModel({
      booking_id: booking['_id'],
      sender_id: senderIdObj,
      receiver_id: receiverId,
      content: content,
    });

    return await newMessage.save();
  }

  async getChatHistory(
    userId: string | Types.ObjectId,
    bookingId: string | Types.ObjectId,
  ): Promise<any> {
    await this.validateUserAccess(userId, bookingId);

    const bookingIdObj =
      typeof bookingId === 'string' ? new Types.ObjectId(bookingId) : bookingId;

    const messages = await this.chatMessageModel
    .find({ booking_id: bookingIdObj })
    .sort({ createdAt: 1 })
    .populate('sender_id', 'full_name role')
    .exec();

    return messages;
  }
}
