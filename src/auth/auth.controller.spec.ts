import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerCustomer: jest.fn(),
    registerServiceProvider: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    generatePasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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
        _id: '123',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
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
        _id: '456',
        email: 'provider@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        business_name: 'Provider Business',
        business_address: '123 Main St',
        tax_id: 'TAX123456',
        role: 'service_provider',
      };

      mockAuthService.registerServiceProvider.mockResolvedValue(expectedResult);

      const result = await authController.registerServiceProvider(createServiceProviderDto);
      expect(result).toEqual(expectedResult);
      expect(authService.registerServiceProvider).toHaveBeenCalledWith(createServiceProviderDto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return token with user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        token: 'jwt_token',
        user: {
          _id: '789',
          email: 'test@example.com',
          role: 'customer',
        }
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid token', async () => {
      const token = 'valid_token';
      mockAuthService.logout.mockResolvedValue('Successfully logged out');

      const result = await authController.logout(`Bearer ${token}`);
      expect(result).toBe('Successfully logged out');
      expect(authService.logout).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid authorization header', async () => {
      await expect(authController.logout('Invalid-header')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate password reset token', async () => {
      const email = 'test@example.com';
      const token = 'reset_token';
      mockAuthService.generatePasswordResetToken.mockResolvedValue(token);

      const result = await authController.forgotPassword({ email });
      expect(result).toEqual({ token });
      expect(authService.generatePasswordResetToken).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should reset password when passwords match', async () => {
      const token = 'valid_token';
      const resetPasswordDto = {
        new_password: 'newpass123',
        confirm_password: 'newpass123',
      };

      mockAuthService.resetPassword.mockResolvedValue('Password updated successfully');

      const result = await authController.resetPassword(token, resetPasswordDto);
      expect(result).toBe('Password updated successfully');
      expect(authService.resetPassword).toHaveBeenCalledWith(token, resetPasswordDto.new_password);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const token = 'valid_token';
      const resetPasswordDto = {
        new_password: 'newpass123',
        confirm_password: 'differentpass',
      };

      await expect(
        authController.resetPassword(token, resetPasswordDto)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
