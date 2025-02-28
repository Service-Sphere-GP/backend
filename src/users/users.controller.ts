// boilerplate for the controller files
import { Controller, Get, Body, Param, Delete, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
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

  @Get('service-providers')
  @ApiTags('Service Providers')
  @ApiOperation({ summary: 'Retrieve all service providers' })
  @ApiResponse({ status: 200, description: 'List of service providers' })
  async getServiceProviders(): Promise<any> {
    return this.usersService.findAllServiceProviders();
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
