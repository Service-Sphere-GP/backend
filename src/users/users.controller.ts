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

@ApiTags('Customers')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('customers')
  @ApiOperation({ summary: 'Retrieve all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async getCustomers(): Promise<any> {
    return this.usersService.findAllCustomers();
  }

  // the create customer endpoint is in the auth controller

  @Patch('customers/:id')
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
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'The deleted customer' })
  async deleteCustomer(@Param('id') id: string) {
    return this.usersService.deleteCustomer(id);
  }
}
