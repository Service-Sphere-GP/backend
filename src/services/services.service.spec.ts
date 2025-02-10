import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { Service } from './schemas/service.schema';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { CloudinaryService } from 'nestjs-cloudinary';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ServicesService', () => {
  let service: ServicesService;
  let serviceModel: any;
  let serviceProviderModel: any;
  let cloudinaryService: CloudinaryService;

  const mockServiceProvider = {
    _id: new Types.ObjectId(),
    services: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockService = {
    _id: new Types.ObjectId(),
    service_name: 'Test Service',
    service_provider_id: mockServiceProvider._id,
    set: jest.fn(),
    save: jest.fn().mockResolvedValue(this),
    deleteOne: jest.fn(),
    toObject: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(Service.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            findById: jest.fn(),
            create: jest.fn().mockImplementation((dto) => ({
              ...dto,
              _id: new Types.ObjectId(),
              save: jest.fn().mockResolvedValue({
                ...dto,
                _id: new Types.ObjectId(),
                toObject: jest.fn().mockReturnValue(dto)
              }),
              toObject: jest.fn().mockReturnValue(dto)
            })),
          },
        },
        {
          provide: getModelToken(ServiceProvider.name),
          useValue: {
            findById: jest.fn().mockResolvedValue(mockServiceProvider),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({ url: 'test-url' }),
          },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    serviceModel = module.get(getModelToken(Service.name));
    serviceProviderModel = module.get(getModelToken(ServiceProvider.name));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      const mockServices = [mockService];
      serviceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockServices),
      });

      const result = await service.getAllServices();
      expect(result).toEqual(mockServices);
      expect(serviceModel.find).toHaveBeenCalled();
    });
  });

  describe('createService', () => {
    const createServiceDto = {
      service_name: 'New Service',
      description: 'Test description',
      base_price: 100,
      category: 'Test Category',
      service_attributes: {},
      status: 'active',
    };

    const mockFiles = [{ path: 'test/path' }] as Express.Multer.File[];

    it('should successfully create a service', async () => {
      const expectedService = {
        ...createServiceDto,
        service_provider_id: mockServiceProvider._id,
        images: ['test-url'],
      };

      const result = await service.createService(
        createServiceDto,
        mockFiles,
        mockServiceProvider._id.toString()
      );

      expect(result).toBeDefined();
      expect(serviceModel.create).toHaveBeenCalledWith({
        ...createServiceDto,
        service_provider_id: mockServiceProvider._id.toString(),
        images: ['test-url'],
      });
      expect(cloudinaryService.uploadFile).toHaveBeenCalled();
      expect(mockServiceProvider.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service provider not found', async () => {
      serviceProviderModel.findById.mockResolvedValue(null);

      await expect(
        service.createService(createServiceDto, mockFiles, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteService', () => {
    it('should delete a service', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValue(mockService);
      jest.spyOn(serviceProviderModel, 'findById').mockResolvedValue(mockServiceProvider);
      mockService.toObject.mockReturnValue(mockService);

      const result = await service.deleteService(mockService._id.toString());

      expect(result).toBeDefined();
      expect(mockService.deleteOne).toHaveBeenCalled();
      expect(mockServiceProvider.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service not found', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValue(null);

      await expect(
        service.deleteService('invalid-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateService', () => {
    const updateServiceDto = {
      service_name: 'Updated Service',
      description: 'Updated description',
    };

    const mockFiles = [{ path: 'test/path' }] as Express.Multer.File[];

    beforeEach(() => {
      mockService.save.mockResolvedValue(mockService);
      mockService.toObject.mockReturnValue(mockService);
    });

    it('should successfully update a service', async () => {
      serviceModel.findById.mockResolvedValue(mockService);
      serviceProviderModel.findById.mockResolvedValue(mockServiceProvider);

      const result = await service.updateService(
        mockService._id.toString(),
        updateServiceDto,
        mockFiles,
      );

      expect(result).toBeDefined();
      expect(mockService.set).toHaveBeenCalled();
      expect(mockService.save).toHaveBeenCalled();
      expect(mockServiceProvider.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service not found', async () => {
      serviceModel.findById.mockResolvedValue(null);

      await expect(
        service.updateService('invalid-id', updateServiceDto, mockFiles),
      ).rejects.toThrow(NotFoundException);
    });
  });
});