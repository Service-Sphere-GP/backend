// src/services/services.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceDto } from './dto/service.dto';
import { Types } from 'mongoose';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: {
            getAllServices: jest.fn(),
            createService: jest.fn(),
            deleteService: jest.fn(),
            updateService: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllServices', () => {
    it('should return an array of ServiceDto', async () => {
      const mockServices: ServiceDto[] = [
        {
          service_name: 'Plumbing',
          service_attributes: { availability: '24/7' },
          base_price: 100,
          status: 'active',
          description: 'All plumbing related services',
          category: 'Home Services',
          creation_time: new Date(),
          images: ['http://example.com/image1.png'],
          service_provider_id: new Types.ObjectId('67976faae068d60c62500836'),
        },
      ];

      jest.spyOn(service, 'getAllServices').mockResolvedValue({
        status: 'success',
        data: mockServices,
      });

      const result = await controller.getAllServices();
      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockServices);
    });
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      const mockServiceDto = {
        service_name: 'Cleaning',
        service_attributes: { availability: 'Weekdays' },
        base_price: 50,
        status: 'active',
        description: 'All cleaning related services',
        category: 'Home Services',
        creation_time: new Date(),
        images: ['http://example.com/image2.png'],
        service_provider_id: new Types.ObjectId('67976faae068d60c62500837'),
      };
      const mockFiles = [];
      jest.spyOn(service, 'createService').mockResolvedValue({
        status: 'success',
        data: mockServiceDto,
      });
      const result = await controller.createService({} as any, mockFiles);
      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockServiceDto);
    });
  });

  describe('deleteService', () => {
    it('should delete a service by Id', async () => {
      const mockDeletedService = {
        service_name: 'Gardening',
        service_attributes: { availability: 'Weekends' },
        base_price: 70,
        status: 'inactive',
        description: 'All gardening related services',
        category: 'Home Services',
        creation_time: new Date(),
        images: ['http://example.com/image3.png'],
        service_provider_id: new Types.ObjectId('67976faae068d60c62500838'),
      };
      jest.spyOn(service, 'deleteService').mockResolvedValue({
        status: 'success',
        data: mockDeletedService,
      });
      const result = await controller.deleteService('fake-id');
      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockDeletedService);
    });
  });

  describe('updateService', () => {
    it('should update a service and return a jsend object', async () => {
      const mockUpdatedService = {
        _id: 'serviceId123',
        service_name: 'New Name',
        service_attributes: { availability: '24/7' },
        base_price: 100,
        status: 'active',
        description: 'Updated service description',
        category: 'Updated Category',
        creation_time: new Date(),
        images: ['http://example.com/updated_image.png'],
        service_provider_id: new Types.ObjectId('67976faae068d60c62500839'),
      };
      jest.spyOn(service, 'updateService').mockResolvedValue({
        status: 'success',
        data: mockUpdatedService,
      });

      const result = await controller.updateService('serviceId123', {} as any, []);
      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockUpdatedService);
      expect(service.updateService).toHaveBeenCalled();
    });
  });
});
