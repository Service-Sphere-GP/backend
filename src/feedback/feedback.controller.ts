import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
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
  @Roles('customer', 'service_provider')
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ): Promise<Feedback> {
    return await this.feedbackService.create(createFeedbackDto, req.user);
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
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer', 'service_provider')
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Feedback> {
    return await this.feedbackService.delete(id, req.user);
  }
}
