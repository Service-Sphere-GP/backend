import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CloudinaryService } from 'nestjs-cloudinary';
import { ServicesService } from './services.service';
import { Service } from './schemas/service.schema';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { NotFoundException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary'; // Import the UploadApiResponse type

describe('ServicesService', () => {
  let service: ServicesService;
  let serviceModel: jest.MockedFunction<any>;
  let serviceProviderModel: any;
  let cloudinaryService: any;

  beforeEach(async () => {
    // Mock the serviceModel as a constructor function
    serviceModel = jest.fn();

    // Mock methods on serviceProviderModel
    serviceProviderModel = {
      findById: jest.fn(),
    };

    // Mock methods on cloudinaryService
    cloudinaryService = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        // Provide the mocked serviceModel
        {
          provide: getModelToken(Service.name),
          useValue: serviceModel,
        },
        // Provide the mocked serviceProviderModel
        {
          provide: getModelToken(ServiceProvider.name),
          useValue: serviceProviderModel,
        },
        // Provide the mocked cloudinaryService
        {
          provide: CloudinaryService,
          useValue: cloudinaryService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllServices', () => {
    it('should return all services in a jsend success object', async () => {
      // Mock the return value of serviceModel.find()
      const mockServices = [{ service_name: 'Test' }];
      serviceModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockServices),
      });

      const result = await service.getAllServices();
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('createService', () => {
    it('should create a service and return a jsend object', async () => {
      // Mock the service provider
      const mockProvider = { services: [], save: jest.fn() };
      serviceProviderModel.findById.mockResolvedValue(mockProvider);

      // Mock the cloudinary uploadFile method with an UploadApiResponse
      cloudinaryService.uploadFile.mockResolvedValue({ url: 'fakeUrl' } as UploadApiResponse);

      // Mock the serviceModel constructor to return an instance with a save method
      const mockServiceInstance = {
        save: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            _id: 'mockCreatedId',
            service_name: 'Test Created',
          }),
        }),
      };
      serviceModel.mockImplementation(() => mockServiceInstance);

      const dto = { service_provider_id: '123', service_name: 'Test Created' } as any;
      const files = [{ path: 'fakePath' }] as any;

      const result = await service.createService(dto, files);

      expect(result.status).toBe('success');
      expect(result.data).toHaveProperty('_id');
      expect(mockProvider.save).toHaveBeenCalled();
      expect(mockServiceInstance.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if provider not found', async () => {
      // Mock findById to return null, simulating a not found provider
      serviceProviderModel.findById.mockResolvedValue(null);

      await expect(
        service.createService({ service_provider_id: 'invalid' } as any, []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteService', () => {
    it('should delete a service and return a jsend object', async () => {
      const mockService = {
        _id: { toString: () => 'serviceId123' },
        service_provider_id: 'providerId123',
        deleteOne: jest.fn().mockResolvedValue({}),
        toObject: jest.fn().mockReturnValue({
          _id: 'serviceId123',
          service_name: 'Deleted Service',
        }),
      };
      serviceModel.findById = jest.fn().mockResolvedValue(mockService);

      const mockProvider = {
        _id: 'providerId123',
        services: [{ _id: { toString: () => 'serviceId123' } }],
        save: jest.fn(),
      };
      serviceProviderModel.findById.mockResolvedValue(mockProvider);

      const result = await service.deleteService('serviceId123');
      expect(result.status).toBe('success');
      expect(result.data).toHaveProperty('_id', 'serviceId123');
      expect(mockService.deleteOne).toHaveBeenCalled();
      expect(mockProvider.services).toHaveLength(0);
    });

    it('should throw NotFoundException if service not found', async () => {
      serviceModel.findById = jest.fn().mockResolvedValue(null);
      await expect(service.deleteService('unknownId')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if provider not found', async () => {
      const mockService = {
        _id: { toString: () => 'serviceId123' },
        service_provider_id: 'invalidProviderId',
        deleteOne: jest.fn(),
        toObject: jest.fn().mockReturnValue({}),
      };
      serviceModel.findById = jest.fn().mockResolvedValue(mockService);
      serviceProviderModel.findById.mockResolvedValue(null);

      await expect(service.deleteService('serviceId123')).rejects.toThrow(NotFoundException);
    });
  });
});