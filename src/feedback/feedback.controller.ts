import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './schemas/feedback.schema';
import { BlacklistedJwtAuthGuard } from './../auth/guards/blacklisted-jwt-auth.guard';
import { Roles } from './../common/decorators/roles.decorators';
import { RolesGuard } from './../auth/guards/roles.guard';
import { CurrentUser } from './../common/decorators/current-user.decorator';
import { RequestUser } from './../common/interfaces/request.interface';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer')
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Feedback> {
    return await this.feedbackService.create(createFeedbackDto, user.user_id);
  }

  @Get()
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get('user')
  @UseGuards(BlacklistedJwtAuthGuard)
  async getUserFeedback(@CurrentUser() user: RequestUser): Promise<Feedback[]> {
    return await this.feedbackService.getUserFeedback(user.user_id);
  }

  @Get('provider/:id')
  async getServiceProviderFeedback(
    @Param('id') id: string,
  ): Promise<Feedback[]> {
    return await this.feedbackService.getServiceProviderFeedback(id);
  }

  @Get('service/:id')
  async getServiceFeedback(@Param('id') id: string): Promise<Feedback[]> {
    return await this.feedbackService.getAllFeedbackByServiceId(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Feedback> {
    return await this.feedbackService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<[]> {
    if (user.role !== 'admin') {
      await this.feedbackService.delete(id, user.user_id);
    } else {
      await this.feedbackService.delete(id);
    }
    return [];
  }
}
