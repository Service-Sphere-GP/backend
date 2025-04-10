import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAllCustomers: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
    findAllServiceProviders: jest.fn(),
    updateServiceProvider: jest.fn(),
    deleteServiceProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('getCustomers', () => {
    it('should return an array of customers', async () => {
      const result = [{ email: 'test@example.com' }];
      mockUsersService.findAllCustomers.mockResolvedValue(result);

      expect(await controller.getCustomers()).toEqual(result);
      expect(mockUsersService.findAllCustomers).toHaveBeenCalled();
    });
  });

  describe('getServiceProviders', () => {
    it('should return an array of service providers', async () => {
      const result = [{ email: 'test@example.com' }];
      mockUsersService.findAllServiceProviders.mockResolvedValue(result);

      expect(await controller.getServiceProviders()).toEqual(result);
      expect(mockUsersService.findAllServiceProviders).toHaveBeenCalled();
    });
  });

  describe('updateCustomer', () => {
    it('should update and return the customer', async () => {
      const id = '123';
      const updateData = { first_name: 'John', last_name: 'Doe' };
      const updatedUser = { _id: id, ...updateData, full_name: 'John Doe' };

      mockUsersService.updateCustomer.mockResolvedValue(updatedUser);

      expect(await controller.updateCustomer(id, updateData)).toEqual(
        updatedUser,
      );
      expect(mockUsersService.updateCustomer).toHaveBeenCalledWith(
        id,
        updateData,
      );
    });
  });

  describe('updateServiceProvider', () => {
    it('should update and return the service provider', async () => {
      const id = '123';
      const updateData = { first_name: 'John', last_name: 'Doe' };
      const updatedUser = { _id: id, ...updateData, full_name: 'John Doe' };

      mockUsersService.updateServiceProvider.mockResolvedValue(updatedUser);

      expect(await controller.updateServiceProvider(id, updateData)).toEqual(
        updatedUser,
      );
      expect(mockUsersService.updateServiceProvider).toHaveBeenCalledWith(
        id,
        updateData,
      );
    });
  });

  describe('deleteCustomer', () => {
    it('should delete and return the customer', async () => {
      const id = '123';
      const deletedUser = { _id: id, email: 'test@example.com' };

      mockUsersService.deleteCustomer.mockResolvedValue(deletedUser);

      expect(await controller.deleteCustomer(id)).toEqual(deletedUser);
      expect(mockUsersService.deleteCustomer).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteServiceProvider', () => {
    it('should delete and return the service provider', async () => {
      const id = '123';
      const deletedUser = { _id: id, email: 'test@example.com' };

      mockUsersService.deleteServiceProvider.mockResolvedValue(deletedUser);

      expect(await controller.deleteServiceProvider(id)).toEqual(deletedUser);
      expect(mockUsersService.deleteServiceProvider).toHaveBeenCalledWith(id);
    });
  });
});
