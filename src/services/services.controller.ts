import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceDto } from './dto/service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * GET /services
   * Retrieve all services offered by all service providers.
   * @returns An array of ServiceDto objects.
   */
  @Get()
  async getAllServices(): Promise<ServiceDto[]> {
    return this.servicesService.getAllServices();
  }
}