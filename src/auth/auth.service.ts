import { Injectable } from '@nestjs/common';
import { UsersService } from './../users/users.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';

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
      const customer = await this.usersService.createUser(customerData);
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
}
