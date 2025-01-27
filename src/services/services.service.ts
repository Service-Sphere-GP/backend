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
    const services = await this.serviceModel.find().exec();
    return services.map((service) => service.toObject());
  }

  async createService(
    createServiceDto: CreateServiceDto,
    files: Express.Multer.File[],
  ): Promise<ServiceDto> {
    const imageUrls = await Promise.all(
      files.map((file) => this.cloudinary.uploadFile(file)),
    );

    const { service_provider_id, ...serviceData } = createServiceDto;
    const serviceProvider =
      await this.serviceProviderModel.findById(service_provider_id);
    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${service_provider_id} not found`,
      );
    }

    const newService = new this.serviceModel({
      ...serviceData,
      service_provider_id: service_provider_id,
      images: imageUrls.map((image) => image.url),
    });

    const savedService = await newService.save();

    serviceProvider.services.push(savedService);
    await serviceProvider.save();

    return savedService.toObject();
  }
  /**
   * Deletes a service by ID.
   * @param serviceId The ID of the service to delete.
   * @returns The deleted service.
   */
  async deleteService(serviceId: string): Promise<ServiceDto> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await service.deleteOne();

    // delete the service from the service provider's services array
    const serviceProvider = await this.serviceProviderModel.findById(
      service.service_provider_id,
    );

    // throw an error if the service provider is not found
    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${service.service_provider_id} not found
      `,
      );
    }

    serviceProvider.services = serviceProvider.services.filter(
      (service) => {
        return service._id.toString() !== serviceId;
      }
    );

    await serviceProvider.save();
    return service.toObject();
  }
}
