// src/services/services.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceDto } from './dto/service.dto';

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
          service_provider_id: 'provider1',
        },
      ];

      jest.spyOn(service, 'getAllServices').mockResolvedValue(mockServices);

      expect(await controller.getAllServices()).toBe(mockServices);
    });
  });
});