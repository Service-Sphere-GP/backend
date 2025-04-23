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
import { UsersService } from './../users/users.service';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
    private readonly servicesService: ServicesService,
    private readonly UsersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async createBooking(
    serviceId: string,
    customerId: string,
  ): Promise<ServiceBookings> {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new BadRequestException('Invalid service ID format');
    }
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID format');
    }

    try {
      const service = await this.servicesService.getServiceById(serviceId);
      if (!service) {
        throw new NotFoundException('Service not found');
      }

      const providerId = service.service_provider?._id.toString();
      const provider = await this.UsersService.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Service provider not available');
      }

      const customer = await this.UsersService.findById(customerId);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const booking = new this.bookingModel({
        customer: customerId,
        service: serviceId,
        status: 'pending',
      });

      const savedBooking = await booking.save();

      await this.notificationService.createNotification({
        title: 'New Service Booking',
        message: `${customer.full_name} has booked your service "${service.service_name}".`,
        recipient: providerId,
        type: 'booking',
        booking_id: savedBooking._id,
        service_id: serviceId,
      });

      return savedBooking;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation failed: ${error.message}`);
      }
      if (error.code === 11000) {
        throw new BadRequestException('Booking already exists');
      }

      console.error('Booking creation error:', error);
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  async getCustomerBookings(customerId: string): Promise<ServiceBookings[]> {
    try {
      if (!Types.ObjectId.isValid(customerId)) {
        throw new BadRequestException('Invalid customer ID format');
      }

      const bookings = await this.bookingModel
        .find({
          customer: customerId,
        })
        .populate({
          path: 'service',
          populate: {
            path: 'service_provider',
            select: 'full_name profile_image',
          },
        })
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

  async getBookingById(bookingId: string): Promise<ServiceBookings> {
    try {
      if (!Types.ObjectId.isValid(bookingId)) {
        throw new BadRequestException('Invalid booking ID format');
      }

      const booking = await this.bookingModel
        .findById(bookingId)
        .populate({
          path: 'service',
          populate: {
            path: 'service_provider',
            select: 'full_name profile_image',
          },
        })
        .populate('customer', 'full_name email profile_image')
        .exec();

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      return booking;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Fetching booking error:', error);
      throw new InternalServerErrorException('Failed to retrieve booking');
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
  ): Promise<ServiceBookings> {
    try {
      if (!Types.ObjectId.isValid(bookingId)) {
        throw new BadRequestException('Invalid booking ID format');
      }

      const booking = await this.bookingModel.findById(bookingId).exec();
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      if (
        !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)
      ) {
        throw new BadRequestException(
          'Invalid status. Must be one of: pending, confirmed, completed, cancelled',
        );
      }

      if (booking.status === status) {
        return booking;
      }

      booking.status = status;
      const updatedBooking = await booking.save();

      const service = await this.servicesService.getServiceById(
        booking.service.toString(),
      );
      const customer = await this.UsersService.findById(
        booking.customer.toString(),
      );

      const customerMessages = {
        pending: `Your booking for "${service.service_name}" is pending confirmation.`,
        confirmed: `Your booking for "${service.service_name}" has been confirmed.`,
        completed: `Your booking for "${service.service_name}" has been marked as completed.`,
        cancelled: `Your booking for "${service.service_name}" has been cancelled.`,
      };

      await this.notificationService.createNotification({
        title: `Booking Status Update: ${status}`,
        message: customerMessages[status],
        recipient: booking.customer.toString(),
        type: 'status_change',
        booking_id: bookingId,
        service_id: booking.service.toString(),
      });

      return updatedBooking;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Booking status update error:', error);
      throw new InternalServerErrorException('Failed to update booking status');
    }
  }

  async getProviderBookings(providerId: string): Promise<ServiceBookings[]> {
    try {
      if (!Types.ObjectId.isValid(providerId)) {
        throw new BadRequestException('Invalid provider ID format');
      }

      const services =
        await this.servicesService.getAllServicesByProviderId(providerId);

      if (!services || services.length === 0) {
        return [];
      }
      const serviceIds = services.map((service) => service._id.toString());

      const bookings = await this.bookingModel
        .find({
          service: {
            $in: serviceIds,
          },
        })
        .populate('customer', 'full_name email profile_image')
        .populate('service')
        .exec();

      return bookings;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Fetching provider bookings error:', error);
      throw new InternalServerErrorException('Failed to retrieve bookings');
    }
  }
}
