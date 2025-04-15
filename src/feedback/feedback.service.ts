import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedbackData = {
      ...createFeedbackDto,
    };
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

  async delete(id){
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    await this.feedbackModel.findByIdAndDelete(id).exec();
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
}
