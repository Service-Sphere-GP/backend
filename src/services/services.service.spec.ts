// src/services/services.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Model } from 'mongoose';
import { ServiceDto } from './dto/service.dto';

const mockServiceProvider = () => ({
  find: jest.fn(),
});

type ServiceProviderModel = Model<ServiceProvider>;

describe('ServicesService', () => {
  let service: ServicesService;
  let model: ServiceProviderModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(ServiceProvider.name),
          useFactory: mockServiceProvider,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    model = module.get<ServiceProviderModel>(getModelToken(ServiceProvider.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllServices', () => {
    it('should return an array of ServiceDto', async () => {
      const mockServices = [
        {
          services: [
            {
              service_name: 'Plumbing',
              service_attributes: { availability: '24/7' },
              base_price: 100,
              status: 'active',
              description: 'All plumbing related services',
              category: 'Home Services',
              creation_time: new Date(),
            },
          ],
          _id: 'provider1',
        },
        {
          services: [
            {
              service_name: 'Electrician',
              service_attributes: { certification: 'Licensed' },
              base_price: 120,
              status: 'active',
              description: 'Electrical maintenance and repairs',
              category: 'Home Services',
              creation_time: new Date(),
            },
          ],
          _id: 'provider2',
        },
      ];

      (model.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockServices),
          }),
        }),
      });

      const result: ServiceDto[] = await service.getAllServices();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('service_name', 'Plumbing');
      expect(result[0]).toHaveProperty('serviceProviderId', 'provider1');
    });
  });
});