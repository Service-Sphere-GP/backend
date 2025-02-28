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

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @UseGuards(BlacklistedJwtAuthGuard)
  @Roles('admin', 'service_provider')
  async getTickets(
    @Query() filters: FilterTicketsDto,
  ) {
    return this.ticketsService.findAll(filters);
  }

  @Put(':id/status')
  @UseGuards(BlacklistedJwtAuthGuard)
  @Roles('admin', 'service_provider')
  async updateStatus(
    @Param('id') ticketId: string,
    @Body() updateDto: UpdateTicketStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.updateTicketStatus(ticketId, updateDto.status, user._id);
  }
}
