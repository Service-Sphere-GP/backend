import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
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
  ApiBody,
} from '@nestjs/swagger';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ServicesService } from '../services/services.service';
import { BookingsService } from './service-bookings.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingService: BookingsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post(':serviceId')
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
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  async getCustomerBookings(@CurrentUser() customer: any) {
    try {
      return await this.bookingService.getCustomerBookings(customer.user_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('provider')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('service_provider')
  async getProviderBookings(@CurrentUser() provider: any) {
    try {
      return await this.bookingService.getProviderBookings(provider.user_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id/status')
  @UseGuards(BlacklistedJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ) {
    try {
      return await this.bookingService.updateBookingStatus(
        id,
        updateStatusDto.status,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
