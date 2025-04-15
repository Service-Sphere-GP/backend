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

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer')
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    return await this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Feedback> {
    return await this.feedbackService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(BlacklistedJwtAuthGuard)
  async delete(@Param('id') id: string): Promise<[]> {
    await this.feedbackService.delete(id);
    return [];
  }
}
