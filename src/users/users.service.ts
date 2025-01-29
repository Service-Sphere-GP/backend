import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<User> {
    const createdCustomer = new this.userModel({ ...createCustomerDto, role: 'customer' });
    return createdCustomer.save();
  }

  async createServiceProvider(createServiceProviderDto: CreateServiceProviderDto): Promise<User> {
    const createdServiceProvider = new this.userModel({ ...createServiceProviderDto, role: 'service_provider' });
    return createdServiceProvider.save();
  }


}
