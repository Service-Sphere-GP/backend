import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './../users/users.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

  async registerServiceProvider(
    createServiceProviderDto: CreateServiceProviderDto,
  ) {
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
      const serviceProvider =
        await this.usersService.createServiceProvider(serviceProviderData);
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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userData } = user;
    return userData;
  }

  async generateToken(user: any): Promise<string> {
    const payload = { email: user._doc.email, role: user._doc.role };
    return this.jwtService.sign(payload);
  }

  async login(loginDto: any) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return {
        status: 'fail',
        data: {
          message: 'Invalid email or password',
        },
      };
    }

    const token = await this.generateToken(user);
    return {
      status: 'success',
      data: {
        token,
        user: user._doc,
      },
    };
  }
}
