import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';
import { FilterTicketsDto } from './dto/filter-tickets.dto';

@Injectable()
export class TicketsService {
  private validTransitions = {
    open: ['in_progress', 'closed'],
    in_progress: ['resolved', 'closed'],
    resolved: ['closed'],
    closed: [],
  };

  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async findAll(filters: FilterTicketsDto) {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assigned_to)
      query.assigned_to = new Types.ObjectId(filters.assigned_to);
    if (filters.booking_id)
      query.booking_id = new Types.ObjectId(filters.booking_id);

    return this.ticketModel
      .find(query)
      .populate('assigned_to', 'business_name email')
      .populate('booking_id', 'status booking_date')
      .exec();
  }

  async updateTicketStatus(
    ticketId: string,
    newStatus: string,
    userId: string,
  ): Promise<Ticket> {
    try {
      if (!Types.ObjectId.isValid(ticketId)) {
        throw new BadRequestException('Invalid ticket ID format');
      }

      const ticket = await this.ticketModel
        .findById(ticketId)
        .orFail(new NotFoundException('Ticket not found'));

      if (!ticket.assigned_to) {
        ticket.assigned_to = new Types.ObjectId(userId);
      }

      const allowedTransitions = this.validTransitions[ticket.status];
      if (!allowedTransitions?.includes(newStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${ticket.status} to ${newStatus}`,
        );
      }

      ticket.status = newStatus;
      if (newStatus === 'resolved') {
        ticket.resolution_time = new Date();
      }

      return await ticket.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Error updating ticket status:', error);
      throw new BadRequestException(error.message);
    }
  }
}
