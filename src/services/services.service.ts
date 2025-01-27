// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Service } from './schemas/service.schema';
import { ServiceDto } from './dto/service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Express } from 'express';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceProvider.name)
    private serviceProviderModel: Model<ServiceProvider>,

    @InjectModel(Service.name) // Injecting Service model
    private serviceModel: Model<Service>, // Defining serviceModel property

    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Retrieve all embedded services from all service providers, including the service provider's ID.
   * @returns An array of ServiceDto objects with serviceProviderId.
   */
  async getAllServices(): Promise<ServiceDto[]> {
    const serviceProviders = await this.serviceProviderModel.find().select('services').lean().exec();

    const allServices: ServiceDto[] = serviceProviders.flatMap(provider => {
      return (provider.services || []).map(service => ({
        ...service,
        service_provider_id: provider._id as Types.ObjectId,
      }));
    });

    return allServices;
  }

    async createService(
      createServiceDto: CreateServiceDto,
      files: Express.Multer.File[],
    ): Promise<ServiceDto> {
      const imageUrls = await Promise.all(
        files.map(file => this.cloudinary.uploadFile(file)),
      );
  
      const { service_provider_id, ...serviceData } = createServiceDto;
      const serviceProvider = await this.serviceProviderModel.findById(
        service_provider_id,
      );
      if (!serviceProvider) {
        throw new NotFoundException(
          `Service Provider with ID ${service_provider_id} not found`,
        );
      }
  
      const newService = new this.serviceModel({
        ...serviceData,
        service_provider_id: new Types.ObjectId(service_provider_id),
        images: imageUrls.map(image => image.url),
      });
  
      const savedService = await newService.save();
  
      serviceProvider.services.push(savedService);
      await serviceProvider.save();
  
      return savedService.toObject();
    }
}