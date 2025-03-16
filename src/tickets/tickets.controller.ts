import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { Roles } from './../common/decorators/roles.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tickets',
    description:
      'Retrieve all support tickets with optional filtering. Only accessible to admins and service providers.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tickets retrieved successfully',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard)
  @Roles('admin', 'service_provider')
  async getTickets(@Query() filters: FilterTicketsDto) {
    return this.ticketsService.findAll(filters);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update ticket status',
    description:
      'Update the status of a specific ticket. Only accessible to admins and service providers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard)
  @Roles('admin', 'service_provider')
  async updateStatus(
    @Param('id') ticketId: string,
    @Body() updateDto: UpdateTicketStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.updateStatus(ticketId, updateDto, user);
  }
}
