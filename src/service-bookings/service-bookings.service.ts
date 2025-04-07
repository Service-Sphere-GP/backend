import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceBookings } from './schemas/service-booking.schema';
import { ServicesService } from '../services/services.service';
import { Ticket } from '../tickets/schemas/ticket.schema';
import { UsersService } from './../users/users.service';
@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    private readonly servicesService: ServicesService,
    private readonly UsersService: UsersService,
  ) {}

  async createBooking(
    serviceId: string,
    customerId: string,
  ): Promise<ServiceBookings> {
    try {
      if (!Types.ObjectId.isValid(serviceId)) {
        throw new BadRequestException('Invalid service ID format');
      }
      if (!Types.ObjectId.isValid(customerId)) {
        throw new BadRequestException('Invalid customer ID format');
      }

      const service = await this.servicesService.getServiceById(serviceId);
      if (!service) {
        throw new NotFoundException('Service not found');
      }

      const provider = await this.UsersService.findById(
        service.service_provider_id.toString(),
      );

      if (!provider) {
        throw new NotFoundException('Service provider not available');
      }

      const ticketId = new Types.ObjectId();

      try {
        const booking = new this.bookingModel({
          customer_id: customerId,
          service_id: serviceId,
          status: 'pending',
          ticket_id: ticketId,
        });

        const savedBooking = await booking.save();

        const ticketData = {
          _id: ticketId,
          booking_id: savedBooking._id,
          status: 'open',
          assigned_to: provider._id,
          createdBy: new Types.ObjectId(customerId),  
        };

        await this.ticketModel.create(ticketData);

        return savedBooking;
      } catch (dbError) {
        if (dbError.name === 'ValidationError') {
          throw new BadRequestException(
            `Validation failed: ${dbError.message}`,
          );
        }
        if (dbError.code === 11000) {
          throw new BadRequestException('Booking already exists');
        }
        throw new InternalServerErrorException('Failed to create booking');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Booking creation error:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getCustomerBookings(customerId: string): Promise<ServiceBookings[]> {
    try {
      if (!Types.ObjectId.isValid(customerId)) {
        throw new BadRequestException('Invalid customer ID format');
      }

      const bookings = await this.bookingModel.find({
        customer_id: customerId,
      })
      .populate('service_id')
      .populate('ticket_id')
      .exec();

      return bookings;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Fetching customer bookings error:', error);
      throw new InternalServerErrorException('Failed to retrieve bookings');
    }
  }
}
