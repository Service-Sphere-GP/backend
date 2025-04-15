import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './schemas/feedback.schema';
import { BlacklistedJwtAuthGuard } from './../auth/guards/blacklisted-jwt-auth.guard';
import { Roles } from './../common/decorators/roles.decorators';
import { RolesGuard } from './../auth/guards/roles.guard';
import { CurrentUser } from './../common/decorators/current-user.decorator';
import { RequestUser } from './../common/interfaces/request.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new feedback for a completed booking' })
  @ApiResponse({
    status: 201,
    description: 'Feedback has been created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation',
  })
  @ApiResponse({ status: 403, description: 'User does not have permission' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Feedback> {
    return await this.feedbackService.create(createFeedbackDto, user.user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get('user')
  @UseGuards(BlacklistedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all feedback submitted by the current user' })
  async getUserFeedback(@CurrentUser() user: RequestUser): Promise<Feedback[]> {
    return await this.feedbackService.getUserFeedback(user.user_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  async findOne(@Param('id') id: string): Promise<Feedback> {
    return await this.feedbackService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiResponse({
    status: 200,
    description: 'Feedback has been deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<[]> {
    // For non-admin users, we need to check if they own the feedback
    if (user.role !== 'admin') {
      await this.feedbackService.delete(id, user.user_id);
    } else {
      await this.feedbackService.delete(id);
    }
    return [];
  }
}
