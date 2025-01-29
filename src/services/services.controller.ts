import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles, Param, Delete } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ServiceDto } from './dto/service.dto';
import { CreateServiceDto } from './dto/create-service.dto'
import { ServiceInterface } from './interfaces/service.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
;

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all services' })
  @ApiResponse({ status: 200, description: 'List of services', type: [ServiceDto] })
  async getAllServices(): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServices();
  }

 @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new service with images' })
  @ApiResponse({ status: 201, description: 'The service has been successfully created.', type: ServiceDto })
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ServiceInterface> {
    return this.servicesService.createService(createServiceDto, files);
  }

  @ApiOperation({ summary: 'Delete a service by Id' })
  @ApiResponse({ status: 200, description: 'The service deleted will be returned' })
  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
  
}