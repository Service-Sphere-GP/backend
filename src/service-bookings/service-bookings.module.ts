import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceBookings,
  ServiceBookingsSchema,
} from './schemas/service-booking.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { BookingsController } from './service-bookings.controller';
import { BookingsService } from './service-bookings.service';
import { UserModule } from 'src/users/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceBookings.name, schema: ServiceBookingsSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    AuthModule,
    forwardRef(() => ServicesModule),
    forwardRef(() => UserModule),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class ServiceBookingsModule {}
