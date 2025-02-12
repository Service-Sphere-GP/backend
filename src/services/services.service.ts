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
import { UpdateServiceDto } from './dto/update-service.dto';

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
  async getAllServices(): Promise<ServiceInterface[]> {
    const services = await this.serviceModel.find().exec();
    return services;
  }

  async createService(
    createServiceDto: CreateServiceDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<ServiceInterface> {
    const imageUrls = await Promise.all(
      files.map((file) => this.cloudinary.uploadFile(file)),
    );
    const { ...serviceData } = createServiceDto;
    const serviceProvider = await this.serviceProviderModel.findById(userId);
    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${userId} not found`,
      );
    }

    const newService = await this.serviceModel.create({
      ...serviceData,
      service_provider_id: userId,
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
  async deleteService(serviceId: string): Promise<ServiceInterface> {
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
    return serviceObject;
  }

  /**
   * Updates a service by ID.
   * @param serviceId The ID of the service to update.
   * @param updateServiceDto The updated service data.
   * @returns The updated service.
   */
  async updateService(
    serviceId: string,
    updateServiceDto: UpdateServiceDto,
    files: Express.Multer.File[],
  ): Promise<ServiceInterface> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    let imageUrls: { url: string }[] = [];
    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) => this.cloudinary.uploadFile(file)),
      );
      imageUrls = uploadResults.map((result) => ({ url: result.url }));
    }

    const { images, ...restUpdateServiceDto } = updateServiceDto;
    const updateData: Partial<Service> = {
      ...restUpdateServiceDto,
      service_provider_id: service.service_provider_id,
    };

    if (imageUrls.length > 0) {
      updateData.images = imageUrls.map((image) => image.url);
    }

    service.set(updateData);
    const savedService = await service.save();
    const serviceObject = savedService.toObject();

    // update that service in the services array of its service provider
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

    const serviceIndex = serviceProvider.services.findIndex(
      (s) => s._id.toString() === serviceId,
    );

    serviceProvider.services[serviceIndex] = service;

    await serviceProvider.save();

    return serviceObject;
  }

  async getServiceById(serviceId: string): Promise<ServiceInterface> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    return service;
  }
}
