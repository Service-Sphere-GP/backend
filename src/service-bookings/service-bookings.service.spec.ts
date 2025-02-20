import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingsService } from './service-bookings.service';
import { ServiceBookings } from './schemas/service-booking.schema';
import { ServicesService } from '../services/services.service';
import { NotFoundException } from '@nestjs/common';

// Create a mock constructor for bookingModel
const mockSave = jest.fn();
const BookingModelMock = jest.fn().mockImplementation((bookingData) => {
  return { ...bookingData, save: mockSave };
});

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingModel: Model<ServiceBookings>;
  let servicesService: ServicesService;

  const mockServicesService = {
    getServiceById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getModelToken(ServiceBookings.name),
          useValue: BookingModelMock,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    // Retrieve the constructor mock
    bookingModel = module.get<Model<ServiceBookings>>(
      getModelToken(ServiceBookings.name),
    );
    servicesService = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    const serviceId = new Types.ObjectId().toString();
    const customerId = new Types.ObjectId().toString();
    const mockService = { _id: serviceId, name: 'Test Service' };
    const savedBooking = {
      _id: new Types.ObjectId(),
      service_id: serviceId,
      customer_id: customerId,
    };

    it('should create a booking successfully', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockSave.mockResolvedValue(savedBooking);

      const result = await service.createBooking(serviceId, customerId);

      expect(result).toEqual(savedBooking);
      expect(mockServicesService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      // Check that the constructor was called with the correct data
      expect(BookingModelMock).toHaveBeenCalledWith({
        customer_id: customerId,
        service_id: serviceId,
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServicesService.getServiceById.mockResolvedValue(null);

      await expect(
        service.createBooking(serviceId, customerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when creation fails', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockSave.mockRejectedValue(new Error('Creation failed'));

      await expect(
        service.createBooking(serviceId, customerId),
      ).rejects.toThrow('Creation failed');
    });
  });
});
