// boilerplate for the controller files
import { Controller, Get, Post, Body, Param, Delete, Patch } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from "@nestjs/swagger";
import { UsersService } from "./users.service";

@ApiTags('Customers')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    
    @Get('customers')
    @ApiOperation({ summary: 'Retrieve all customers' })
    @ApiResponse({ status: 200, description: 'List of customers' })
    async getCustomers() : Promise<any> {
        return this.usersService.findAllCustomers();
    }

    // the create customer endpoint is in the auth controller

    @Patch('customers/:id')
    @ApiOperation({ summary: 'Update a customer' })
    @ApiResponse({ status: 200, description: 'The updated customer' })
    async updateCustomer(@Param('id') id: string) {
        return 'updated customer'
    }

    @Delete('customers/:id')
    @ApiOperation({ summary: 'Delete a customer' })
    @ApiResponse({ status: 200, description: 'The deleted customer' })
    async deleteCustomer(@Param('id') id: string) {
        return 'deleted customer'
    }
}