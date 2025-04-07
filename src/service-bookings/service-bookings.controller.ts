import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ServicesService } from '../services/services.service';
import { BookingsService } from './service-bookings.service';

@ApiTags('Bookings')
@Controller('services/:serviceId/bookings')
export class BookingsController {
  constructor(
    private readonly bookingService: BookingsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a booking for a service',
    description:
      'Creates a new booking for the specified service. Only customers can book services.',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service to book',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid booking data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('customer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBooking(
    @Param('serviceId') serviceId: string,
    @CurrentUser() customer: any,
  ) {
    const service = await this.servicesService.getServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    try {
      return await this.bookingService.createBooking(
        serviceId,
        customer.user_id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings for customer',
    description: 'Retrieves all bookings made by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin','customer')
  async getCustomerBookings(@CurrentUser() customer: any) {
    try {
      return await this.bookingService.getCustomerBookings(customer.user_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
