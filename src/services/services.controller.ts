import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ServiceDto } from './dto/service.dto';
import { CreateServiceDto } from './dto/create-service.dto'
import { FilesInterceptor } from '@nestjs/platform-express';
;

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

 @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new service with uploaded images',
    required: true,
    schema: {
      type: 'object',
      properties: {
        service_name: { type: 'string', example: 'Plumbing' },
        service_attributes: { type: 'object', example: { availability: '24/7' } },
        base_price: { type: 'number', example: 100 },
        status: { type: 'string', example: 'active' },
        description: { type: 'string', example: 'Plumbing services' },
        category: { type: 'string', example: 'Home Services' },
        service_provider_id: { type: 'string', example: '67976faae068d60c62500836' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Create a new service with images' })
  @ApiResponse({ status: 201, description: 'The service has been successfully created.', type: ServiceDto })
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ServiceDto> {
    return this.servicesService.createService(createServiceDto, files);
  }
}