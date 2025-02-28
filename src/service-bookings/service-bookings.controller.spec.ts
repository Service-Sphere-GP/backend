import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './service-bookings.controller';
import { BookingsService } from './service-bookings.service';
import { ServicesService } from '../services/services.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: BookingsService;
  let servicesService: ServicesService;

  const mockBookingsService = {
    createBooking: jest.fn(),
  };

  const mockServicesService = {
    getServiceById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingsService = module.get<BookingsService>(BookingsService);
    servicesService = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const serviceId = new Types.ObjectId().toString();
    const customerId = new Types.ObjectId().toString();
    const mockCustomer = { user_id: customerId };
    const mockService = { _id: serviceId, name: 'Test Service' };
    const mockBooking = {
      _id: new Types.ObjectId(),
      service_id: serviceId,
      customer_id: customerId,
    };

    it('should create a booking successfully', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockBookingsService.createBooking.mockResolvedValue(mockBooking);

      const result = await controller.createBooking(serviceId, mockCustomer);

      expect(result).toEqual(mockBooking);
      expect(servicesService.getServiceById).toHaveBeenCalledWith(serviceId);
      expect(bookingsService.createBooking).toHaveBeenCalledWith(
        serviceId,
        customerId,
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServicesService.getServiceById.mockResolvedValue(null);

      await expect(
        controller.createBooking(serviceId, mockCustomer),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on booking service error', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockBookingsService.createBooking.mockRejectedValue(
        new Error('Booking failed'),
      );

      await expect(
        controller.createBooking(serviceId, mockCustomer),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
