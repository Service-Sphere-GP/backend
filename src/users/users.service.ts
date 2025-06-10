import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User } from './schemas/user.schema';
import { ServicesService } from '../services/services.service';
import { CloudinaryService } from 'nestjs-cloudinary';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private servicesService: ServicesService,
    private readonly cloudinary: CloudinaryService,
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

  async updateCustomer(
    id: string,
    updateData: any,
    file?: Express.Multer.File,
  ) {
    // Find the current customer first
    const customer = await this.userModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    // Handle profile image upload if a file was provided
    if (file) {
      try {
        const uploadResult = await this.cloudinary.uploadFile(file, {
          folder: 'ServiceSphere/users',
        });
        updateData.profile_image = uploadResult.url;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        // Continue with the update even if image upload fails
      }
    }

    // Only set full_name if first_name or last_name is being updated
    if (updateData.first_name || updateData.last_name) {
      const firstName = updateData.first_name || customer.first_name;
      const lastName = updateData.last_name || customer.last_name;
      updateData.full_name = `${firstName} ${lastName}`;
    }

    // Apply updates to the document
    Object.keys(updateData).forEach((key) => {
      customer[key] = updateData[key];
    });

    // Save the updated document
    const savedCustomer = await customer.save();

    return savedCustomer;
  }

  async deleteCustomer(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAllServiceProviders(): Promise<User[] | null> {
    return this.userModel.find({ role: 'service_provider' }).exec();
  }

  async updateServiceProvider(
    id: string,
    updateData: any,
    file?: Express.Multer.File,
  ) {
    // Find the current service provider first
    const serviceProvider = await this.userModel.findById(id).exec();
    if (!serviceProvider) {
      throw new NotFoundException(`Service provider with id ${id} not found`);
    }

    // Handle profile image upload if a file was provided
    if (file) {
      try {
        const uploadResult = await this.cloudinary.uploadFile(file, {
          folder: 'ServiceSphere/users',
        });
        updateData.profile_image = uploadResult.url;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        // Continue with the update even if image upload fails
      }
    }

    // Only set full_name if first_name or last_name is being updated
    if (updateData.first_name || updateData.last_name) {
      const firstName = updateData.first_name || serviceProvider.first_name;
      const lastName = updateData.last_name || serviceProvider.last_name;
      updateData.full_name = `${firstName} ${lastName}`;
    }

    // Apply updates to the document
    Object.keys(updateData).forEach((key) => {
      serviceProvider[key] = updateData[key];
    });

    // Save the updated document
    const savedServiceProvider = await serviceProvider.save();

    return savedServiceProvider;
  }

  async deleteServiceProvider(id: string) {
    const serviceProvider = await this.userModel.findById(id).exec();
    if (!serviceProvider) {
      throw new NotFoundException(`Service provider with id ${id} not found`);
    }

    // Find all services associated with this provider and delete them
    // Instead of iterating through serviceProvider.services
    const services = await this.servicesService.getAllServicesByProviderId(id);
    for (const service of services) {
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
        email_verified: true,
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

  async updateAdmin(id: string, updateData: any, file?: Express.Multer.File) {
    // Find the current admin first
    const admin = await this.userModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    // Handle profile image upload if a file was provided
    if (file) {
      try {
        const uploadResult = await this.cloudinary.uploadFile(file, {
          folder: 'ServiceSphere/users',
        });
        updateData.profile_image = uploadResult.url;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        // Continue with the update even if image upload fails
      }
    }

    // Only set full_name if first_name or last_name is being updated
    if (updateData.first_name || updateData.last_name) {
      const firstName = updateData.first_name || admin.first_name;
      const lastName = updateData.last_name || admin.last_name;
      updateData.full_name = `${firstName} ${lastName}`;
    }

    // Apply updates to the document
    Object.keys(updateData).forEach((key) => {
      admin[key] = updateData[key];
    });

    // Save the updated document
    const savedAdmin = await admin.save();

    return savedAdmin;
  }

  async deleteAdmin(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findByBusinessName(businessName: string): Promise<User | null> {
    return this.userModel
      .findOne({
        business_name: businessName,
        role: 'service_provider',
      })
      .exec();
  }

  async findByTaxId(taxId: string): Promise<User | null> {
    return this.userModel
      .findOne({
        tax_id: taxId,
        role: 'service_provider',
      })
      .exec();
  }
}
