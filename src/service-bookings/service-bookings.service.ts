import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceBookings } from './schemas/service-booking.schema';
import { ServicesService } from '../services/services.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
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

    return booking.save();
  }
}
