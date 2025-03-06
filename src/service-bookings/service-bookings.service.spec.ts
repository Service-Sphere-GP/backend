import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingsService } from './service-bookings.service';
import { ServiceBookings } from './schemas/service-booking.schema';
import { ServicesService } from '../services/services.service';
import { NotFoundException } from '@nestjs/common';
import { Ticket } from '../tickets/schemas/ticket.schema';
import { UsersService } from '../users/users.service';

// Create a mock constructor for bookingModel
const mockSave = jest.fn();
const BookingModelMock = jest.fn().mockImplementation((bookingData) => {
  return { ...bookingData, save: mockSave };
});

// Mock TicketModel with create method
const TicketModelMock = {
  create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
};

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingModel: Model<ServiceBookings>;
  let servicesService: ServicesService;
  let usersService: UsersService;

  const mockServicesService = {
    getServiceById: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
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
          provide: getModelToken(Ticket.name),
          useValue: TicketModelMock,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    // Retrieve the constructor mock
    bookingModel = module.get<Model<ServiceBookings>>(
      getModelToken(ServiceBookings.name),
    );
    servicesService = module.get<ServicesService>(ServicesService);
    usersService = module.get<UsersService>(UsersService);
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
    const providerId = new Types.ObjectId().toString();
    const mockService = {
      _id: serviceId,
      name: 'Test Service',
      service_provider_id: providerId,
    };
    const mockProvider = {
      _id: providerId,
      name: 'Test Provider',
    };
    const savedBooking = {
      _id: new Types.ObjectId(),
      service_id: serviceId,
      customer_id: customerId,
      status: 'pending',
      ticket_id: new Types.ObjectId(),
    };

    it('should create a booking successfully', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.findById.mockResolvedValue(mockProvider);
      mockSave.mockResolvedValue(savedBooking);

      const result = await service.createBooking(serviceId, customerId);

      expect(result).toEqual(savedBooking);
      expect(mockServicesService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(
        providerId.toString(),
      );
      // Check that the constructor was called with the correct data
      expect(BookingModelMock).toHaveBeenCalledWith({
        customer_id: customerId,
        service_id: serviceId,
        status: 'pending',
        ticket_id: expect.any(Types.ObjectId),
      });
      expect(mockSave).toHaveBeenCalled();
      expect(TicketModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_id: savedBooking._id,
          status: 'open',
          assigned_to: mockProvider._id,
        }),
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServicesService.getServiceById.mockResolvedValue(null);

      await expect(
        service.createBooking(serviceId, customerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when provider not found', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.createBooking(serviceId, customerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when creation fails', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.findById.mockResolvedValue(mockProvider);
      mockSave.mockRejectedValue(new Error('Creation failed'));

      await expect(
        service.createBooking(serviceId, customerId),
      ).rejects.toThrow('Failed to create booking');
    });
  });
});
