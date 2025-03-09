// boilerplate for the controller files
import { Controller, Get, Body, Param, Delete, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

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
  @ApiBody({
    type: User,
    examples: {
      updateCustomerExample: {
        summary: 'Example JSON payload',
        value: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiConsumes('application/json')
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.usersService.updateCustomer(id, updateData);
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
  @ApiBody({
    type: User,
    examples: {
      updateCustomerExample: {
        summary: 'Example JSON payload',
        value: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a service provider' })
  @ApiResponse({ status: 200, description: 'The updated service provider' })
  async updateServiceProvider(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.usersService.updateServiceProvider(id, updateData);
  }

  @Delete('service-providers/:id')
  @ApiTags('Service Providers')
  @ApiOperation({ summary: 'Delete a service provider' })
  @ApiResponse({ status: 200, description: 'The deleted service provider' })
  async deleteServiceProvider(@Param('id') id: string) {
    return this.usersService.deleteServiceProvider(id);
  }
}
