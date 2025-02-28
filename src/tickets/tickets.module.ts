import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketSchema } from './schemas/ticket.schema';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ticket', schema: TicketSchema }]),
    UserModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
