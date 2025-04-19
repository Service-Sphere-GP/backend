import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('customers')
  async getCustomers(): Promise<any> {
    return this.usersService.findAllCustomers();
  }

  @Get('customers/:id')
  async getCustomerById(@Param('id') id: string): Promise<any> {
    return this.usersService.findCustomerById(id);
  }

  @Get('service-providers')
  async getServiceProviders(): Promise<any> {
    return this.usersService.findAllServiceProviders();
  }

  @Get('service-providers/:id')
  async getServiceProviderById(@Param('id') id: string): Promise<any> {
    return this.usersService.findServiceProviderById(id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.usersService.findById(id);
  }

  // the create customer endpoint is in the auth controller

  @Patch('customers/:id')
  @UseInterceptors(FileInterceptor('profile_image'))
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateCustomer(id, updateData, file);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.usersService.deleteCustomer(id);
  }

  @Patch('service-providers/:id')
  @UseInterceptors(FileInterceptor('profile_image'))
  async updateServiceProvider(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateServiceProvider(id, updateData, file);
  }

  @Delete('service-providers/:id')
  async deleteServiceProvider(@Param('id') id: string) {
    return this.usersService.deleteServiceProvider(id);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdmins(): Promise<any> {
    return this.usersService.findAllAdmins();
  }

  @Get('admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminById(@Param('id') id: string): Promise<any> {
    return this.usersService.findAdminById(id);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<any> {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Patch('admins/:id')
  @UseInterceptors(FileInterceptor('profile_image'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateAdmin(id, updateData, file);
  }

  @Delete('admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }
}
