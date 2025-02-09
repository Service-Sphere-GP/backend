import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Param,
  Delete,
  Patch,
  UseGuards
} from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth
} from '@nestjs/swagger';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceInterface } from './interfaces/service.interface';
import { FilesInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Roles } from './../common/decorators/roles.decorators';
import { RolesGuard } from './../auth/guards/roles.guard';


@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all services' })
  @ApiResponse({ status: 200, description: 'List of services' })
  async getAllServices(): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServices();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new service with images' })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
    type: ServiceDto,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','service_provider')
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ServiceInterface> {
    return this.servicesService.createService(createServiceDto, files);
  }

  @ApiOperation({ summary: 'Delete a service by Id' })
  @ApiResponse({
    status: 200,
    description: 'The service deleted will be returned',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','service_provider')
  @Delete(':id')
  async deleteService(
    @Param('id') id: string,
  ): Promise<ServiceInterface> {
    return this.servicesService.deleteService(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','service_provider')
  @UseInterceptors(FilesInterceptor('images'))
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ServiceInterface> {
    return this.servicesService.updateService(id, updateServiceDto, files);
  }
}
