import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ServicesService } from '../services/services.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @Inject(forwardRef(() => ServicesService))
    private servicesService: ServicesService,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedbackData = {
      ...createFeedbackDto,
    };
    const newFeedback = await this.feedbackModel.create(feedbackData);

    await this.updateServiceRating(newFeedback.service.toString());

    return newFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackModel.find().exec();
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async delete(id: string): Promise<void> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
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
      .exec();
    if (!feedback) {
      throw new NotFoundException(
        `Feedback for service ID ${serviceId} not found`,
      );
    }
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
