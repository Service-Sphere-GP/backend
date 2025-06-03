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
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceInterface } from './interfaces/service.interface';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Roles } from './../common/decorators/roles.decorators';
import { RolesGuard } from './../auth/guards/roles.guard';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CategoriesService } from '../categories/categories.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.categoriesService.findAll();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider', 'customer')
  async getAllServices(): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServices();
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('service_provider')
  async getMyServices(
    @CurrentUser() currentUser: any,
  ): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServicesByProviderId(currentUser.user_id);
  }

  @Get('provider/:providerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider', 'customer')
  async getServicesByProviderId(
    @Param('providerId') providerId: string,
  ): Promise<ServiceInterface[]> {
    return this.servicesService.getAllServicesByProviderId(providerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider', 'customer')
  async getServiceById(@Param('id') id: string): Promise<ServiceInterface> {
    return this.servicesService.getServiceById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'service_provider')
  async deleteService(@Param('id') id: string): Promise<ServiceInterface> {
    return this.servicesService.deleteService(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
