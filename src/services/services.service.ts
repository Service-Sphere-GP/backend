// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Import Types
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Service } from './schemas/service.schema';
import { ServiceInterface } from './interfaces/service.interface';
import { CreateServiceDto } from './dto/create-service.dto';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Express } from 'express';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FeedbackService } from '../feedback/feedback.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceProvider.name)
    private serviceProviderModel: Model<ServiceProvider>,

    @InjectModel(Service.name)
    private serviceModel: Model<Service>,

    private readonly cloudinary: CloudinaryService,
    private readonly feedbackService: FeedbackService,
  ) {}

  async getAllServices(): Promise<ServiceInterface[]> {
    const services = await this.serviceModel
      .find()
      .populate('service_provider', 'full_name business_name rating_average')
      .exec();
    return services;
  }

  async createService(
    createServiceDto: CreateServiceDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<ServiceInterface> {
    const imageUrls = await Promise.all(
      files.map((file) =>
        this.cloudinary.uploadFile(file, {
          folder: 'ServiceSphere',
        }),
      ),
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
      service_provider: userId,
      images: imageUrls.map((image) => image.url),
    });

    const savedService = await newService.save();
    return savedService;
  }

  async deleteService(serviceId: string): Promise<ServiceInterface> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await service.deleteOne();

    const serviceProvider = await this.serviceProviderModel.findById(
      service.service_provider,
    );

    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${service.service_provider} not found
      `,
      );
    }
    const serviceObject = service.toObject();
    return serviceObject;
  }

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
        files.map((file) =>
          this.cloudinary.uploadFile(file, {
            folder: 'ServiceSphere',
          }),
        ),
      );
      imageUrls = uploadResults.map((result) => ({ url: result.url }));
    }

    const { images, categories, ...restUpdateServiceDto } = updateServiceDto;

    const updateData: Partial<Service> = {
      ...restUpdateServiceDto,
      service_provider: service.service_provider,
    };

    if (categories && categories.length > 0) {
      updateData.categories = categories.map((id) => new Types.ObjectId(id));
    }

    if (imageUrls.length > 0) {
      updateData.images = imageUrls.map((image) => image.url);
    }

    service.set(updateData);
    const savedService = await service.save();
    const serviceObject = savedService.toObject();

    const serviceProvider = await this.serviceProviderModel.findById(
      service.service_provider,
    );

    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${service.service_provider} not found
      `,
      );
    }

    return serviceObject;
  }

  async getServiceById(serviceId: string): Promise<ServiceInterface> {
    const service = await this.serviceModel
      .findById(serviceId)
      .populate(
        'service_provider',
        'full_name business_name rating_average profile_image',
      )
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    return service;
  }

  async getAllServicesByProviderId(serviceProviderId: string): Promise<any> {
    const serviceProvider = await this.serviceProviderModel
      .findById(serviceProviderId)
      .exec();

    if (!serviceProvider) {
      throw new NotFoundException(
        `Service Provider with ID ${serviceProviderId} not found`,
      );
    }

    return this.serviceModel
      .find({ service_provider: serviceProviderId })
      .exec();
  }

  async updateServiceRating(serviceId: string): Promise<boolean> {
    try {
      const service = await this.serviceModel.findById(serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      const averageRating =
        await this.feedbackService.calculateAverageRating(serviceId);

      await this.serviceModel.updateOne(
        { _id: serviceId },
        { rating_average: averageRating },
      );

      await this.updateProviderRating(service.service_provider.toString());

      return true;
    } catch (error) {
      console.error(`Error updating service rating for ${serviceId}:`, error);
      return false;
    }
  }

  async calculateProviderAverageRating(providerId: string): Promise<number> {
    try {
      const services = await this.serviceModel
        .find({
          service_provider: providerId,
        })
        .exec();

      if (!services || services.length === 0) {
        return 0;
      }

      const totalRating = services.reduce(
        (sum, service) => sum + (service.rating_average || 0),
        0,
      );

      const averageRating = totalRating / services.length;
      return Math.round(averageRating * 10) / 10;
    } catch (error) {
      console.error(
        `Error calculating provider average rating for ${providerId}:`,
        error,
      );
      return 0;
    }
  }

  async updateProviderRating(providerId: string): Promise<boolean> {
    try {
      const provider = await this.serviceProviderModel.findById(providerId);
      if (!provider) {
        throw new NotFoundException(
          `Service Provider with ID ${providerId} not found`,
        );
      }

      const averageRating =
        await this.calculateProviderAverageRating(providerId);

      await this.serviceProviderModel.updateOne(
        { _id: providerId },
        { rating_average: averageRating },
      );

      return true;
    } catch (error) {
      console.error(`Error updating provider rating for ${providerId}:`, error);
      return false;
    }
  }
}
