import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from './refresh-token.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let refreshTokensService: Partial<RefreshTokensService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createCustomer: jest.fn(),
      createServiceProvider: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    refreshTokensService = {
      storeRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokensService, useValue: refreshTokensService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('registerCustomer', () => {
    const createCustomerDto = {
      email: 'customer@example.com',
      password: 'password123',
      confirm_password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should return fail if email already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'existingId',
        email: 'customer@example.com',
        first_name: 'Existing',
        last_name: 'User',
        role: 'customer',
      });
      const result = await authService.registerCustomer(createCustomerDto);
      expect(result).toEqual({
        status: 'fail',
        data: { email: 'Email already exists' },
      });
    });

    it('should create customer if email does not exist', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const fakeCustomer = {
        _id: '1',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
      };
      (usersService.createCustomer as jest.Mock).mockResolvedValue(fakeCustomer);

      const result = await authService.registerCustomer(createCustomerDto);
      expect(result).toEqual({
        status: 'success',
        data: fakeCustomer,
      });
    });

    it('should return error if create customer fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createCustomer as jest.Mock).mockRejectedValue(new Error('DB error'));
      const result = await authService.registerCustomer(createCustomerDto);
      expect(result).toEqual({
        status: 'error',
        message: 'Failed to create customer',
        code: 400,
      });
    });
  });

  describe('registerServiceProvider', () => {
    const createServiceProviderDto = {
      email: 'provider@example.com',
      password: 'password123',
      confirm_password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      business_name: 'Provider Business',
      business_address: '123 Main St',
      tax_id: 'TAX123456',
    };

    it('should return fail if email already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'existingId',
        email: 'provider@example.com',
        first_name: 'Existing',
        last_name: 'User',
        role: 'service_provider',
      });
      const result = await authService.registerServiceProvider(createServiceProviderDto);
      expect(result).toEqual({
        status: 'fail',
        data: { email: 'Email already exists' },
      });
    });

    it('should create service provider if email does not exist', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const fakeServiceProvider = {
        _id: '2',
        email: 'provider@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        business_name: 'Provider Business',
        business_address: '123 Main St',
        tax_id: 'TAX123456',
        role: 'service_provider',
      };
      (usersService.createServiceProvider as jest.Mock).mockResolvedValue(fakeServiceProvider);

      const result = await authService.registerServiceProvider(createServiceProviderDto);
      expect(result).toEqual({
        status: 'success',
        data: fakeServiceProvider,
      });
    });

    it('should return error if create service provider fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createServiceProvider as jest.Mock).mockRejectedValue(new Error('DB error'));
      const result = await authService.registerServiceProvider(createServiceProviderDto);
      expect(result).toEqual({
        status: 'error',
        message: 'Failed to create service provider',
        code: 400,
      });
    });
  });

  describe('login', () => {
    const loginDto = { email: 'customer@example.com', password: 'password123' };
      const fakeUser = {
      _id: '1',
      email: 'customer@example.com',
      password: 'hashedPass', 
      first_name: 'John',
      last_name: 'Doe',
      role: 'customer',
      _doc: {
        _id: '1',
        email: 'customer@example.com',
        password: 'hashedPass',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
      },
    };
  
    beforeEach(() => {
      jest.spyOn(bcrypt, 'compare').mockImplementation((pass, hash) => {
        return Promise.resolve(pass === 'password123' && hash === 'hashedPass');
      });
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return tokens and user data for valid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(fakeUser);
      const userData = {
        _id: '1',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
      };
      (jwtService.sign as jest.Mock).mockImplementation((payload, options) => {
        return `${payload.type}_token`;
      });
      const result = await authService.login(loginDto);
      expect(result.status).toEqual('success');
      expect(result.data).toHaveProperty('tokens');
      expect(result.data.tokens).toHaveProperty('accessToken');
      expect(result.data.tokens).toHaveProperty('refreshToken');
      expect(result.data).toHaveProperty('user');
      expect(result.data.user).toMatchObject(userData);
    });
  });
  

  describe('refreshToken', () => {
    const refreshTokenStr = 'refresh_token';
    const fakePayload = {
      sub: '1',
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'customer',
      type: 'refresh',
    };
    const fakeUser = {
      _doc: {
        _id: '1',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
      },
    };

    beforeEach(() => {
      (jwtService.verify as jest.Mock).mockReturnValue(fakePayload);
      (usersService.findByEmail as jest.Mock).mockResolvedValue(fakeUser);
      (jwtService.sign as jest.Mock).mockImplementation((payload, options) => {
        return `${payload.type}_token`;
      });
    });

    it('should throw UnauthorizedException if token type is invalid', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ ...fakePayload, type: 'access' });
      await expect(authService.refreshToken(refreshTokenStr)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token validation fails', async () => {
      (refreshTokensService.validateRefreshToken as jest.Mock).mockRejectedValue(new Error('invalid'));
      await expect(authService.refreshToken(refreshTokenStr)).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens on valid refresh token', async () => {
      const tokens = await authService.refreshToken(refreshTokenStr);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });
});
