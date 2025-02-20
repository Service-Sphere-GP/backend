import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketSchema } from './schemas/ticket.schema';
import { ServiceProviderSchema } from '../users/schemas/service-provider.schema';
import { ServiceBookingsSchema } from './../service-bookings/schemas/service-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
    ]),
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
