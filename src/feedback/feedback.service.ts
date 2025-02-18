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
      given_to_service: createFeedbackDto.given_to_service ?? null,
    };
    if (user.role === 'customer') {
      feedbackData.given_to_customer = user.user_id;
    } else if (user.role === 'service_provider') {
      feedbackData.given_to_provider = user.user_id;
    }
    const newFeedback = await this.feedbackModel.create(feedbackData);
    return newFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackModel.find().exec();
  }

  async findOne(id: string): Promise<Feedback> {
    console.log('id, ', id);
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async delete(id: string, current_user: any): Promise<Feedback> {
    console.log('id, ', id);
    console.log('current_user, ', current_user);
    // check if the feedback exists
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // check if the feedback belongs to the user
    if (
      feedback.given_to_customer.toString() !== current_user.user_id &&
      feedback.given_to_provider.toString() !== current_user.user_id
    ) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    await this.feedbackModel.findByIdAndDelete(id).exec();

    return feedback;
  }
}
