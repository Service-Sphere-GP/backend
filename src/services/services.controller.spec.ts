import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceDto } from './dto/service.dto';
import { Types } from 'mongoose';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  const mockService = {
    getAllServices: jest.fn(),
    createService: jest.fn(),
    deleteService: jest.fn(),
    updateService: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(BlacklistedJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllServices', () => {
    it('should return an array of services', async () => {
      const mockServices = [
        {
          _id: new Types.ObjectId(),
          service_name: 'Test Service',
          description: 'Test Description',
          base_price: 100,
          service_provider_id: new Types.ObjectId(),
          images: ['image1.jpg'],
          category: 'Test Category',
          service_attributes: {},
          status: 'active',
          creation_time: new Date(),
        },
      ];

      mockService.getAllServices.mockResolvedValue(mockServices);
      const result = await controller.getAllServices();
      expect(result).toEqual(mockServices);
      expect(mockService.getAllServices).toHaveBeenCalled();
    });
  });

  describe('createService', () => {
    const createServiceDto = {
      service_name: 'New Service',
      description: 'New Description',
      base_price: 150,
      category: 'New Category',
      service_attributes: {},
      status: 'active',
    };

    const mockFiles = [{ filename: 'test.jpg' }] as Express.Multer.File[];
    const mockRequest = {
      user: { user_id: new Types.ObjectId().toString() },
    };

    it('should create a new service', async () => {
      const expectedService = {
        ...createServiceDto,
        _id: new Types.ObjectId(),
        service_provider_id: mockRequest.user.user_id,
        images: ['uploaded-image-url.jpg'],
      };

      mockService.createService.mockResolvedValue(expectedService);

      const result = await controller.createService(
        createServiceDto,
        mockFiles,
        mockRequest,
      );

      expect(result).toEqual(expectedService);
      expect(mockService.createService).toHaveBeenCalledWith(
        createServiceDto,
        mockFiles,
        mockRequest.user.user_id,
      );
    });
  });

  describe('deleteService', () => {
    const serviceId = new Types.ObjectId().toString();

    it('should delete a service', async () => {
      const deletedService = {
        _id: serviceId,
        service_name: 'Deleted Service',
      };

      mockService.deleteService.mockResolvedValue(deletedService);

      const result = await controller.deleteService(serviceId);
      expect(result).toEqual(deletedService);
      expect(mockService.deleteService).toHaveBeenCalledWith(serviceId);
    });
  });

  describe('updateService', () => {
    const serviceId = new Types.ObjectId().toString();
    const updateServiceDto = {
      service_name: 'Updated Service',
      description: 'Updated Description',
    };
    const mockFiles = [{ filename: 'updated.jpg' }] as Express.Multer.File[];

    it('should update a service', async () => {
      const updatedService = {
        _id: serviceId,
        ...updateServiceDto,
        images: ['updated-image-url.jpg'],
      };

      mockService.updateService.mockResolvedValue(updatedService);

      const result = await controller.updateService(
        serviceId,
        updateServiceDto,
        mockFiles,
      );

      expect(result).toEqual(updatedService);
      expect(mockService.updateService).toHaveBeenCalledWith(
        serviceId,
        updateServiceDto,
        mockFiles,
      );
    });
  });
});
