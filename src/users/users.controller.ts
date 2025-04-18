// boilerplate for the controller files
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('customers')
  @ApiTags('Customers')
  @ApiOperation({ summary: 'Retrieve all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async getCustomers(): Promise<any> {
    return this.usersService.findAllCustomers();
  }

  @Get('customers/:id')
  @ApiTags('Customers')
  @ApiOperation({ summary: 'Retrieve a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'The customer' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('id') id: string): Promise<any> {
    return this.usersService.findCustomerById(id);
  }

  @Get('service-providers')
  @ApiTags('Service Providers')
  @ApiOperation({ summary: 'Retrieve all service providers' })
  @ApiResponse({ status: 200, description: 'List of service providers' })
  async getServiceProviders(): Promise<any> {
    return this.usersService.findAllServiceProviders();
  }

  @Get('service-providers/:id')
  @ApiTags('Service Providers')
  @ApiOperation({ summary: 'Retrieve a service provider by ID' })
  @ApiParam({ name: 'id', description: 'Service Provider ID' })
  @ApiResponse({ status: 200, description: 'The service provider' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  async getServiceProviderById(@Param('id') id: string): Promise<any> {
    return this.usersService.findServiceProviderById(id);
  }

  @Get(':id')
  @ApiTags('Users')
  @ApiOperation({ summary: 'Retrieve a user by ID regardless of role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.usersService.findById(id);
  }

  // the create customer endpoint is in the auth controller

  @Patch('customers/:id')
  @ApiTags('Customers')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'The updated customer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profile_image'))
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateCustomer(id, updateData, file);
  }

  @Delete('customers/:id')
  @ApiTags('Customers')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'The deleted customer' })
  async deleteCustomer(@Param('id') id: string) {
    return this.usersService.deleteCustomer(id);
  }

  @Patch('service-providers/:id')
  @ApiTags('Service Providers')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        business_name: { type: 'string' },
        business_address: { type: 'string' },
        tax_id: { type: 'string' },
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a service provider' })
  @ApiResponse({ status: 200, description: 'The updated service provider' })
  @UseInterceptors(FileInterceptor('profile_image'))
  async updateServiceProvider(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateServiceProvider(id, updateData, file);
  }

  @Delete('service-providers/:id')
  @ApiTags('Service Providers')
  @ApiOperation({ summary: 'Delete a service provider' })
  @ApiResponse({ status: 200, description: 'The deleted service provider' })
  async deleteServiceProvider(@Param('id') id: string) {
    return this.usersService.deleteServiceProvider(id);
  }

  @Get('admins')
  @ApiTags('Admins')
  @ApiOperation({ summary: 'Retrieve all admins' })
  @ApiResponse({ status: 200, description: 'List of admins' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdmins(): Promise<any> {
    return this.usersService.findAllAdmins();
  }

  @Get('admins/:id')
  @ApiTags('Admins')
  @ApiOperation({ summary: 'Retrieve an admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiResponse({ status: 200, description: 'The admin' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminById(@Param('id') id: string): Promise<any> {
    return this.usersService.findAdminById(id);
  }

  @Post('admins')
  @ApiTags('Admins')
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiBody({
    type: CreateAdminDto,
    examples: {
      createAdminExample: {
        summary: 'Example JSON payload',
        value: {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          password: 'securePassword123',
          confirm_password: 'securePassword123',
          permissions: ['manage_users', 'manage_services'],
        },
      },
    },
  })
  @ApiConsumes('application/json')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<any> {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Patch('admins/:id')
  @ApiTags('Admins')
  @ApiOperation({ summary: 'Update an admin' })
  @ApiResponse({ status: 200, description: 'The updated admin' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        permissions: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiBearerAuth()
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
  @ApiTags('Admins')
  @ApiOperation({ summary: 'Delete an admin' })
  @ApiResponse({ status: 200, description: 'The deleted admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }
}
