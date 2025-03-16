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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new feedback',
    description:
      'Submit feedback about the platform or services. Only customers and service providers can submit feedback.',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback has been successfully created',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer', 'service_provider')
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ): Promise<Feedback> {
    return await this.feedbackService.create(createFeedbackDto, req.user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all feedback',
    description: 'Retrieve all feedback submitted by users',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all feedback retrieved successfully',
  })
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get feedback by ID',
    description: 'Retrieve specific feedback by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string): Promise<Feedback> {
    return await this.feedbackService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete feedback',
    description:
      'Delete specific feedback by its ID. Users can only delete their own feedback.',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Feedback> {
    return await this.feedbackService.delete(id, req.user);
  }
}
