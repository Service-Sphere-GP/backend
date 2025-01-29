// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Service } from './schemas/service.schema';
import { ServiceInterface } from './interfaces/service.interface';
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
   * @returns An array of ServiceInterface objects with serviceProviderId.
   */
  async getAllServices(): Promise<{ status: string; data: ServiceInterface[] }> {
    const services = await this.serviceModel.find().exec();
    return { status: 'success', data: services };
  }

  async createService(
    createServiceDto: CreateServiceDto,
    files: Express.Multer.File[],
  ): Promise<{ status: string; data: ServiceInterface }> {
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

    const savedServiceObject = savedService.toObject();
    return { status: 'success', data: savedServiceObject };
  }
  /**
   * Deletes a service by ID.
   * @param serviceId The ID of the service to delete.
   * @returns The deleted service.
   */
  async deleteService(serviceId: string): Promise<{ status: string; data: ServiceInterface }> {
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

    serviceProvider.services = serviceProvider.services.filter((service) => {
      return service._id.toString() !== serviceId;
    });

    await serviceProvider.save();
    const serviceObject = service.toObject();
    return { status: 'success', data: serviceObject };
  }
}
