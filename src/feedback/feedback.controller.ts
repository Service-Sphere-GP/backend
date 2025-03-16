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
  ApiBody,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
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
    content: {
      'application/json': {
        examples: {
          customerFeedback: {
            summary: 'Customer feedback example',
            description: 'A customer providing feedback about a service',
            value: {
              id: '507f1f77bcf86cd799439011',
              rating: 5,
              message:
                'Great service! Very satisfied with the plumbing repair.',
              about_service: '507f1f77bcf86cd799439012',
              from_customer: '507f1f77bcf86cd799439013',
              from_provider: null,
            },
          },
          providerFeedback: {
            summary: 'Provider feedback example',
            description: 'A service provider giving feedback about a customer',
            value: {
              id: '507f1f77bcf86cd799439014',
              rating: 4,
              message:
                'Customer was very cooperative and the job went smoothly.',
              about_service: '507f1f77bcf86cd799439015',
              from_provider: '507f1f77bcf86cd799439016',
              about_customer: '507f1f77bcf86cd799439017',
            },
          },
        },
      },
    },
  })
  @ApiBody({
    description: 'Feedback data to be submitted',
    examples: {
      customerExample: {
        summary: 'Customer feedback submission',
        description:
          'Example of a customer submitting feedback about a service',
        value: {
          rating: 5,
          message: 'Great service! Very satisfied with the plumbing repair.',
          about_service: '507f1f77bcf86cd799439012',
        },
      },
      providerExample: {
        summary: 'Provider feedback submission',
        description:
          'Example of a service provider submitting feedback about a customer',
        value: {
          rating: 4,
          message: 'Customer was very cooperative and the job went smoothly.',
          about_service: '507f1f77bcf86cd799439015',
          about_customer: '507f1f77bcf86cd799439017',
        },
      },
    },
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
    content: {
      'application/json': {
        example: [
          {
            id: '507f1f77bcf86cd799439011',
            rating: 5,
            message: 'Great service! Very satisfied with the plumbing repair.',
            about_service: '507f1f77bcf86cd799439012',
            from_customer: '507f1f77bcf86cd799439013',
            from_provider: null,
          },
          {
            id: '507f1f77bcf86cd799439014',
            rating: 4,
            message: 'Customer was very cooperative and the job went smoothly.',
            about_service: '507f1f77bcf86cd799439015',
            from_provider: '507f1f77bcf86cd799439016',
            about_customer: '507f1f77bcf86cd799439017',
          },
        ],
      },
    },
  })
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get feedback by ID',
    description: 'Retrieve specific feedback by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Feedback ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
    content: {
      'application/json': {
        examples: {
          customerFeedback: {
            summary: 'Customer feedback example',
            value: {
              id: '507f1f77bcf86cd799439011',
              rating: 5,
              message:
                'Great service! Very satisfied with the plumbing repair.',
              about_service: '507f1f77bcf86cd799439012',
              from_customer: '507f1f77bcf86cd799439013',
              from_provider: null,
            },
          },
          providerFeedback: {
            summary: 'Provider feedback example',
            value: {
              id: '507f1f77bcf86cd799439014',
              rating: 4,
              message:
                'Customer was very cooperative and the job went smoothly.',
              about_service: '507f1f77bcf86cd799439015',
              from_provider: '507f1f77bcf86cd799439016',
              about_customer: '507f1f77bcf86cd799439017',
            },
          },
        },
      },
    },
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
  @ApiParam({
    name: 'id',
    description: 'ID of the feedback to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback deleted successfully',
    content: {
      'application/json': {
        example: {
          id: '507f1f77bcf86cd799439011',
          rating: 5,
          message: 'Great service! Very satisfied with the plumbing repair.',
          about_service: '507f1f77bcf86cd799439012',
          from_customer: '507f1f77bcf86cd799439013',
          from_provider: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Feedback not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Feedback with ID 507f1f77bcf86cd799439999 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Feedback> {
    return await this.feedbackService.delete(id, req.user);
  }
}
