import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
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

    // Find the current service provider first
    const serviceProvider = await this.userModel.findById(id).exec();
    if (!serviceProvider) {
      throw new NotFoundException(`Service provider with id ${id} not found`);
    }

    // Only set full_name if first_name or last_name is being updated
    if (updateData.first_name || updateData.last_name) {
      const firstName = updateData.first_name || serviceProvider.first_name;
      const lastName = updateData.last_name || serviceProvider.last_name;
      updateData.full_name = `${firstName} ${lastName}`;
    }


    // Instead of using findByIdAndUpdate, update the document directly and save it
    try {
      // Apply updates to the document
      Object.keys(updateData).forEach((key) => {
        serviceProvider[key] = updateData[key];
      });

      // Save the updated document
      const savedServiceProvider = await serviceProvider.save();


      return savedServiceProvider;
    } catch (error) {
      throw error;
    }
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

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    try {
      // Set default permissions if not provided
      if (!createAdminDto.permissions) {
        createAdminDto.permissions = [];
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

      // Create admin without using the pre-save hook for password validation
      const adminData = {
        first_name: createAdminDto.first_name,
        last_name: createAdminDto.last_name,
        email: createAdminDto.email,
        password: hashedPassword, // Already hashed
        full_name: `${createAdminDto.first_name} ${createAdminDto.last_name}`,
        role: 'admin',
        permissions: createAdminDto.permissions,
      };

      console.log('Attempting to save admin user to database');

      // Create the admin user directly
      const createdAdmin = new this.userModel(adminData);

      // Save without triggering password validation
      const savedAdmin = await createdAdmin.save({ validateBeforeSave: false });

      console.log('Admin user saved successfully with ID:', savedAdmin.id);

      return savedAdmin;
    } catch (error) {
      console.error('Error in createAdmin method:', error);
      throw error; // Re-throw to be caught by the calling method
    }
  }

  async findAllAdmins(): Promise<User[] | null> {
    return this.userModel.find({ role: 'admin' }).exec();
  }

  async findAdminById(id: string): Promise<User> {
    const admin = await this.userModel
      .findOne({ _id: id, role: 'admin' })
      .exec();
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }
    return admin;
  }

  async updateAdmin(id: string, updateData: Partial<User>) {
    updateData.full_name = `${updateData.first_name} ${updateData.last_name}`;
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteAdmin(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
