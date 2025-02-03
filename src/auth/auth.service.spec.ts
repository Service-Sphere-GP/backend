import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from './refresh-token.service';
import { PasswordResetTokensService } from './password-reset-token.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let refreshTokensService: Partial<RefreshTokensService>;
  let passwordResetTokensService: Partial<PasswordResetTokensService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createCustomer: jest.fn(),
      createServiceProvider: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    refreshTokensService = {
      storeRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      invalidateRefreshTokens: jest.fn(),
    };

    passwordResetTokensService = {
      deleteAllTokensForUser: jest.fn(),
      createToken: jest.fn(),
      findByToken: jest.fn(),
      deleteToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokensService, useValue: refreshTokensService },
        {
          provide: PasswordResetTokensService,
          useValue: passwordResetTokensService,
        },
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
      (usersService.createCustomer as jest.Mock).mockResolvedValue(
        fakeCustomer,
      );

      const result = await authService.registerCustomer(createCustomerDto);
      expect(result).toEqual({
        status: 'success',
        data: fakeCustomer,
      });
    });

    it('should return error if create customer fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createCustomer as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
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
      const result = await authService.registerServiceProvider(
        createServiceProviderDto,
      );
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
      (usersService.createServiceProvider as jest.Mock).mockResolvedValue(
        fakeServiceProvider,
      );

      const result = await authService.registerServiceProvider(
        createServiceProviderDto,
      );
      expect(result).toEqual({
        status: 'success',
        data: fakeServiceProvider,
      });
    });

    it('should return error if create service provider fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createServiceProvider as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      const result = await authService.registerServiceProvider(
        createServiceProviderDto,
      );
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
      (jwtService.verify as jest.Mock).mockReturnValue({
        ...fakePayload,
        type: 'access',
      });
      await expect(authService.refreshToken(refreshTokenStr)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token validation fails', async () => {
      (
        refreshTokensService.validateRefreshToken as jest.Mock
      ).mockRejectedValue(new Error('invalid'));
      await expect(authService.refreshToken(refreshTokenStr)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens on valid refresh token', async () => {
      const tokens = await authService.refreshToken(refreshTokenStr);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });
  describe('logout', () => {
    const validAccessToken = 'valid_access_token';
    const invalidAccessToken = 'invalid_access_token';
    const userId = 'user123';

    beforeEach(() => {
      refreshTokensService.invalidateRefreshTokens = jest.fn();

      (jwtService.verify as jest.Mock).mockImplementation((token, options) => {
        if (token === validAccessToken) {
          return { sub: userId };
        }
        throw new Error('Invalid token');
      });
    });

    it('should invalidate refresh tokens with valid access token', async () => {
      const result = await authService.logout(validAccessToken);

      expect(jwtService.verify).toHaveBeenCalledWith(validAccessToken, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });
      expect(refreshTokensService.invalidateRefreshTokens).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({
        status: 'success',
        message: 'Successfully logged out',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      await expect(authService.logout(invalidAccessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle token verification failure', async () => {
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Token expired');
      });

      await expect(authService.logout(validAccessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call invalidateRefreshTokens with correct user ID', async () => {
      await authService.logout(validAccessToken);
      expect(refreshTokensService.invalidateRefreshTokens).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('generatePasswordResetToken', () => {
    const email = 'user@example.com';
    const user = {
      _id: '123',
      email,
      toString: () => '123',
    };

    it('should throw NotFoundException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.generatePasswordResetToken(email),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete existing tokens and create new one', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (passwordResetTokensService.createToken as jest.Mock).mockResolvedValue(
        {},
      );

      const token = await authService.generatePasswordResetToken(email);

      expect(
        passwordResetTokensService.deleteAllTokensForUser,
      ).toHaveBeenCalledWith('123');
      expect(passwordResetTokensService.createToken).toHaveBeenCalled();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(40);
    });
  });

  describe('resetPassword', () => {
    const validToken = 'valid-token';
    const newPassword = 'newSecurePassword123';
    const user = {
      _id: '123',
      toString: () => '123',
    };
    const validResetToken = {
      _id: {
        toString: () => 'token-id', 
      },
      user_id: '123',
      expires_at: new Date(Date.now() + 3600000),
    };
    const expiredResetToken = {
      ...validResetToken,
      expires_at: new Date(Date.now() - 1000),
    };

    it('should throw for invalid token', async () => {
      (passwordResetTokensService.findByToken as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        authService.resetPassword(validToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle expired token', async () => {
      (passwordResetTokensService.findByToken as jest.Mock).mockResolvedValue(
        expiredResetToken,
      );
      await expect(
        authService.resetPassword(validToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
      expect(passwordResetTokensService.deleteToken).toHaveBeenCalledWith(
        'token-id',
      );
    });

    it('should cleanup token when user not found', async () => {
      (passwordResetTokensService.findByToken as jest.Mock).mockResolvedValue(
        validResetToken,
      );
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.resetPassword(validToken, newPassword),
      ).rejects.toThrow(NotFoundException);
      expect(passwordResetTokensService.deleteToken).toHaveBeenCalledWith(
        'token-id',
      );
    });

    it('should update password and delete token', async () => {
      (passwordResetTokensService.findByToken as jest.Mock).mockResolvedValue(
        validResetToken,
      );
      (usersService.findById as jest.Mock).mockResolvedValue(user);
      (usersService.updatePassword as jest.Mock).mockResolvedValue(user);

      const result = await authService.resetPassword(validToken, newPassword);

      expect(usersService.updatePassword).toHaveBeenCalledWith(
        '123',
        newPassword,
      );
      expect(passwordResetTokensService.deleteToken).toHaveBeenCalledWith(
        'token-id',
      );
      expect(result).toEqual({
        status: 'success',
        message: 'Password updated successfully',
      });
    });

    it('should succeed even if token deletion fails', async () => {
      (passwordResetTokensService.findByToken as jest.Mock).mockResolvedValue(
        validResetToken,
      );
      (usersService.findById as jest.Mock).mockResolvedValue(user);
      (passwordResetTokensService.deleteToken as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      const result = await authService.resetPassword(validToken, newPassword);

      expect(result.status).toBe('success');
      expect(usersService.updatePassword).toHaveBeenCalled();
    });
  });
});
