// src/chat/chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { UserModule } from '../users/user.module';
import { ServiceBookingsModule } from '../service-bookings/service-bookings.module';
import { ServicesModule } from '../services/services.module';
import {
  ServiceBookings,
  ServiceBookingsSchema,
} from '../service-bookings/schemas/service-booking.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ServiceBookings.name, schema: ServiceBookingsSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => ServiceBookingsModule),
    forwardRef(() => ServicesModule),
  ],
  providers: [ChatGateway, ChatService, JwtService, ConfigService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
