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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceInterface } from './interfaces/service.interface';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Roles } from './../common/decorators/roles.decorators';
import { RolesGuard } from './../auth/guards/roles.guard';
import { BlacklistedJwtAuthGuard } from './..//auth/guards/blacklisted-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all services',
    description: 'Returns a list of all available services in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of services retrieved successfully',
    type: [ServiceDto],
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider', 'customer')
  async getAllServices(): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServices();
  }

  @Get('my-services')
  @ApiOperation({
    summary: 'Get all services of the logged-in user',
    description:
      'Returns all services created by the authenticated service provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of services retrieved successfully',
    type: [ServiceDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a service provider',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('service_provider')
  async getMyServices(
    @CurrentUser() currentUser: any,
  ): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServicesByProviderId(currentUser.user_id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a service by ID',
    description: 'Returns detailed information about a specific service.',
  })
  @ApiResponse({
    status: 200,
    description: 'The service with the specified ID',
    type: ServiceDto,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider', 'customer')
  async getServiceById(@Param('id') id: string): Promise<ServiceInterface> {
    return this.servicesService.getServiceById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new service with images',
    description:
      'Creates a new service with the provided details and optional images. Requires admin or service provider role.',
  })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
    type: ServiceDto,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider')
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any, // add request to get user
  ): Promise<ServiceInterface> {
    return this.servicesService.createService(
      createServiceDto,
      files,
      req.user.user_id,
    );
  }

  @ApiOperation({
    summary: 'Delete a service by Id',
    description:
      'Deletes a service with the specified ID. Requires admin or service provider role.',
  })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully deleted',
    type: ServiceDto,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider')
  @Delete(':id')
  async deleteService(@Param('id') id: string): Promise<ServiceInterface> {
    return this.servicesService.deleteService(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update a service',
    description:
      'Updates a service with the specified ID. Requires admin or service provider role.',
  })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully updated',
    type: ServiceDto,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBearerAuth('access-token')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider')
  @UseInterceptors(FilesInterceptor('images'))
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ServiceInterface> {
    return this.servicesService.updateService(id, updateServiceDto, files);
  }
}
