import { Injectable } from '@nestjs/common';
import { UsersService } from './../users/users.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async registerCustomer(createCustomerDto: CreateCustomerDto) {
    const existingUser = await this.usersService.findByEmail(
      createCustomerDto.email,
    );
    if (existingUser) {
      return {
        status: 'fail',
        data: {
          email: 'Email already exists',
        },
      };
    }

    const customerData = {
      ...createCustomerDto,
      role: 'customer',
    };

    try {
      const customer = await this.usersService.createCustomer(customerData);
      return {
        status: 'success',
        data: customer,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create customer',
        code: 400,
      };
    }
  }

  async registerServiceProvider(createServiceProviderDto: CreateServiceProviderDto) {
    const existingUser = await this.usersService.findByEmail(
      createServiceProviderDto.email,
    );
    if (existingUser) {
      return {
        status: 'fail',
        data: {
          email: 'Email already exists',
        },
      };
    }

    const serviceProviderData = {
      ...createServiceProviderDto,
      role: 'service_provider',
    };

    try {
      const serviceProvider = await this.usersService.createServiceProvider(
        serviceProviderData,
      );
      return {
        status: 'success',
        data: serviceProvider,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create service provider',
        code: 400,
      };
    }
  }


}
