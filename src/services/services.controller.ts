import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceDto } from './dto/service.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all services' })
  @ApiResponse({ status: 200, description: 'List of services', type: [ServiceDto] })
  async getAllServices(): Promise<ServiceDto[]> {
    return this.servicesService.getAllServices();
  }
}