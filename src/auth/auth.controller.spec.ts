import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerCustomer: jest.fn(),
    registerServiceProvider: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerCustomer', () => {
    it('should call authService.registerCustomer and return the result', async () => {
      const createCustomerDto: CreateCustomerDto = {
        email: 'customer@example.com',
        password: 'password123',
        confirm_password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const expectedResult = {
        status: 'success',
        data: {
          _id: '123',
          email: 'customer@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'customer',
        },
      };

      mockAuthService.registerCustomer.mockResolvedValue(expectedResult);

      const result = await authController.registerCustomer(createCustomerDto);
      expect(result).toEqual(expectedResult);
      expect(authService.registerCustomer).toHaveBeenCalledWith(createCustomerDto);
    });
  });

  describe('registerServiceProvider', () => {
    it('should call authService.registerServiceProvider and return the result', async () => {
      const createServiceProviderDto: CreateServiceProviderDto = {
        email: 'provider@example.com',
        password: 'password123',
        confirm_password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        business_name: 'Provider Business',
        business_address: '123 Main St',
        tax_id: 'TAX123456',
      };

      const expectedResult = {
        status: 'success',
        data: {
          _id: '456',
          email: 'provider@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          business_name: 'Provider Business',
          business_address: '123 Main St',
          tax_id: 'TAX123456',
          role: 'service_provider',
        },
      };

      mockAuthService.registerServiceProvider.mockResolvedValue(expectedResult);

      const result = await authController.registerServiceProvider(createServiceProviderDto);
      expect(result).toEqual(expectedResult);
      expect(authService.registerServiceProvider).toHaveBeenCalledWith(createServiceProviderDto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = {
        email: 'login@example.com',
        password: 'password123',
      };

      const expectedResult = {
        status: 'success',
        data: {
          tokens: { accessToken: 'access_token', refreshToken: 'refresh_token' },
          user: {
            _id: '789',
            email: 'login@example.com',
            first_name: 'Login',
            last_name: 'User',
            role: 'customer',
          },
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken and return the result', async () => {
      const refreshDto: RefreshDto = { refreshToken: 'some_refresh_token' };

      const expectedResult = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await authController.refresh(refreshDto);
      expect(result).toEqual(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshDto.refreshToken);
    });
  });
});
