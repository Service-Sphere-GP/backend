import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
    user: any,
  ): Promise<Feedback> {
    const feedbackData: any = {
      rating: createFeedbackDto.rating,
      message: createFeedbackDto.message,
      about_service:
        createFeedbackDto.about_service ||
        createFeedbackDto.given_to_service ||
        null,
      about_customer: createFeedbackDto.about_customer || null,
    };

    // Assign the user ID based on their role
    if (user.role === 'customer') {
      feedbackData.from_customer = user.user_id;
    } else if (user.role === 'service_provider') {
      feedbackData.from_provider = user.user_id;
    }

    const newFeedback = await this.feedbackModel.create(feedbackData);
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

  async delete(id: string, current_user: any): Promise<Feedback> {
    // check if the feedback exists
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // check if the feedback belongs to the user
    const fromCustomerId = feedback.from_customer?.toString();
    const fromProviderId = feedback.from_provider?.toString();

    if (
      fromCustomerId !== current_user.user_id &&
      fromProviderId !== current_user.user_id
    ) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    await this.feedbackModel.findByIdAndDelete(id).exec();
    return feedback;
  }
}
