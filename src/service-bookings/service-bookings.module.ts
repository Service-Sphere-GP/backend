import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ServiceBookings,
  ServiceBookingsSchema,
} from './schemas/service-booking.schema';
import { ServiceBookingsService } from './service-bookings.service';
import { ServiceBookingsController } from './service-bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceBookings.name, schema: ServiceBookingsSchema },
    ]),
  ],
  controllers: [ServiceBookingsController],
  providers: [ServiceBookingsService],
})
export class ServiceBookingsModule {}
