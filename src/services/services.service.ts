import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Model } from 'mongoose';
import { ServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceProvider.name)
    private serviceProviderModel: Model<ServiceProvider>,
  ) {}

  /**
   * Retrieve all embedded services from all service providers, including the service provider's ID.
   * @returns An array of ServiceDto objects with serviceProviderId.
   */
  async getAllServices(): Promise<ServiceDto[]> {
    // Fetch all service providers with their embedded services
    const serviceProviders = await this.serviceProviderModel.find().select('services').lean().exec();

    // Map each service to include the serviceProviderId
    const allServices: ServiceDto[] = serviceProviders.flatMap(provider => {
      return (provider.services || []).map(service => ({
        ...service,
        serviceProviderId: provider._id.toString(),
      }));
    });

    return allServices;
  }
}