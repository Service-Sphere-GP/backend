import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ServicesService } from '../services/services.service';
import { ServiceBookings } from '../service-bookings/schemas/service-booking.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @Inject(forwardRef(() => ServicesService))
    private servicesService: ServicesService,
    @InjectModel(ServiceBookings.name)
    private bookingModel: Model<ServiceBookings>,
  ) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
    userId: string,
  ): Promise<Feedback> {
    const booking = await this.bookingModel
      .findById(createFeedbackDto.booking)
      .exec();

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createFeedbackDto.booking} not found`,
      );
    }

    const bookingCustomerId = booking.customer.toString();
    const userIdStr = userId.toString();

    if (bookingCustomerId !== userIdStr) {
      throw new ForbiddenException(
        'You can only leave feedback for your own bookings',
      );
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException(
        'You can only leave feedback for completed bookings',
      );
    }

    const bookingServiceId = booking.service.toString();
    const dtoServiceId = createFeedbackDto.service.toString();

    if (bookingServiceId !== dtoServiceId) {
      throw new BadRequestException(
        'Service ID does not match the service in this booking',
      );
    }

    const existingFeedback = await this.feedbackModel
      .findOne({
        booking: createFeedbackDto.booking,
        user: userId,
      })
      .exec();

    if (existingFeedback) {
      throw new BadRequestException(
        'You have already submitted feedback for this booking',
      );
    }

    const feedbackData = {
      ...createFeedbackDto,
      user: userId,
    };

    const newFeedback = await this.feedbackModel.create(feedbackData);
    await this.updateServiceRating(newFeedback.service.toString());

    return newFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackModel
      .find()
      .populate('user', 'first_name last_name profile_image')
      .populate('service', 'service_name')
      .populate('service', 'name')
      .exec();
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel
      .findById(id)
      .populate('user', 'first_name last_name profile_image')
      .populate('service', 'service_name')
      .populate('service', 'name')
      .exec();

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const feedback = await this.feedbackModel.findById(id).exec();

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    const userIdStr = userId.toString();
    const feedbackUserIdStr = feedback.user.toString();

    if (userId && userIdStr !== feedbackUserIdStr) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    const serviceId = feedback.service;

    await this.feedbackModel.findByIdAndDelete(id).exec();

    if (serviceId) {
      await this.updateServiceRating(serviceId.toString());
    }
  }

  async getAllFeedbackByServiceId(serviceId: string): Promise<Feedback[]> {
    const feedback = await this.feedbackModel
      .find({ service: serviceId })
      .populate('user', 'first_name last_name profile_image')
      .populate('service', 'service_name')
      .exec();

    if (!feedback) {
      throw new NotFoundException(
        `Feedback for service ID ${serviceId} not found`,
      );
    }

    return feedback;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await this.feedbackModel
      .find({ user: userId })
      .populate('service', 'name')
      .populate('service', 'service_name')
      .populate('booking')
      .exec();
  }

  async getServiceProviderFeedback(providerId: string): Promise<Feedback[]> {
    if (!Types.ObjectId.isValid(providerId)) {
      throw new BadRequestException('Invalid service provider ID format');
    }

    const services =
      await this.servicesService.getAllServicesByProviderId(providerId);

    if (!services || services.length === 0) {
      return [];
    }

    const serviceIds = services.map((service) => service._id.toString());


    const feedback = await this.feedbackModel
      .find({
        service: {
          $in: serviceIds,
        },
      })
      .populate('user', 'first_name last_name profile_image')
      .populate('service', 'service_name')
      .populate('booking')
      .exec();

    return feedback;
  }

  async calculateAverageRating(serviceId: string): Promise<number> {
    const allFeedback = await this.feedbackModel
      .find({ service: serviceId })
      .exec();

    if (!allFeedback || allFeedback.length === 0) {
      return 0;
    }

    const totalRating = allFeedback.reduce(
      (sum, feedback) => sum + feedback.rating,
      0,
    );
    const averageRating = totalRating / allFeedback.length;

    return Math.round(averageRating * 10) / 10;
  }

  async updateServiceRating(serviceId: string): Promise<number> {
    const averageRating = await this.calculateAverageRating(serviceId);
    await this.servicesService.updateServiceRating(serviceId);
    return averageRating;
  }
}
