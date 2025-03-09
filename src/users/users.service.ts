import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { User } from './schemas/user.schema';
import { ServicesService } from '../services/services.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private servicesService: ServicesService,
  ) {}

  async findAllCustomers(): Promise<User[] | null> {
    return this.userModel.find({ role: 'customer' }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async findCustomerById(id: string): Promise<User> {
    const customer = await this.userModel
      .findOne({ _id: id, role: 'customer' })
      .exec();
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }

  async findServiceProviderById(id: string): Promise<User> {
    const serviceProvider = await this.userModel
      .findOne({ _id: id, role: 'service_provider' })
      .exec();
    if (!serviceProvider) {
      throw new NotFoundException(`Service provider with id ${id} not found`);
    }
    return serviceProvider;
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<User> {
    const createdCustomer = new this.userModel({
      ...createCustomerDto,
      role: 'customer',
    });
    return createdCustomer.save();
  }

  async createServiceProvider(
    createServiceProviderDto: CreateServiceProviderDto,
  ): Promise<User> {
    const createdServiceProvider = new this.userModel({
      ...createServiceProviderDto,
      role: 'service_provider',
    });
    return createdServiceProvider.save();
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
      .exec();
  }

  async updateCustomer(id: string, updateData: Partial<User>) {
    updateData.full_name = `${updateData.first_name} ${updateData.last_name}`;
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteCustomer(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAllServiceProviders(): Promise<User[] | null> {
    return this.userModel.find({ role: 'service_provider' }).exec();
  }

  async updateServiceProvider(id: string, updateData: Partial<User>) {
    updateData.full_name = `${updateData.first_name} ${updateData.last_name}`;
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteServiceProvider(id: string) {
    const serviceProvider: any = await this.userModel.findById(id).exec();
    if (!serviceProvider) {
      throw new NotFoundException(`Service provider with id ${id} not found`);
    }

    for (const service of serviceProvider.services) {
      await this.servicesService.deleteService(service._id);
    }

    return this.userModel.findByIdAndDelete(id).exec();
  }
}
