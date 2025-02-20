import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceBookings } from './schemas/service-booking.schema';
import { ServicesService } from '../services/services.service';
import { Ticket } from '../tickets/schemas/ticket.schema'; 
import { Service } from '../services/schemas/service.schema'; 

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    private readonly servicesService: ServicesService,
  ) {}

  async createBooking(
    serviceId: string,
    customerId: string,
  ): Promise<ServiceBookings> {
    const service = await this.servicesService.getServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const booking = new this.bookingModel({
      customer_id: customerId,
      service_id: serviceId,
    });
    const savedBooking = await booking.save();

    const ticketData = {
      booking_id: savedBooking._id,
      status: 'open',
    };

    await this.ticketModel.create(ticketData);

    return savedBooking;
  }
}
