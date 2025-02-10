import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetTokensService } from './password-reset-token.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let passwordResetTokensService: Partial<PasswordResetTokensService>;
  let tokenBlacklistService: Partial<TokenBlacklistService>;

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

    passwordResetTokensService = {
      deleteAllTokensForUser: jest.fn(),
      createToken: jest.fn(),
      findByToken: jest.fn(),
      deleteToken: jest.fn(),
    };

    tokenBlacklistService = {
      blacklistToken: jest.fn(),
      isBlacklisted: jest.fn(),
      removeExpiredTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PasswordResetTokensService, useValue: passwordResetTokensService },
        { provide: TokenBlacklistService, useValue: tokenBlacklistService },
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
      await expect(authService.registerCustomer(createCustomerDto))
        .rejects.toThrow('Email already exists');
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
      expect(result).toEqual(fakeCustomer);
    });

    it('should return error if create customer fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createCustomer as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(authService.registerCustomer(createCustomerDto))
        .rejects.toThrow('Failed to create customer');
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
      await expect(authService.registerServiceProvider(
        createServiceProviderDto,
      ))
        .rejects.toThrow('Email already exists');
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
      expect(result).toEqual(fakeServiceProvider);
    });

    it('should return error if create service provider fails', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createServiceProvider as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(authService.registerServiceProvider(
        createServiceProviderDto,
      ))
        .rejects.toThrow('Failed to create service provider');
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
      jest.spyOn(bcrypt, 'compare').mockImplementation((pass, hash) => 
        Promise.resolve(pass === 'password123' && hash === 'hashedPass')
      );
      (jwtService.sign as jest.Mock).mockReturnValue('jwt_token');
    });

    it('should return token and user data for valid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(fakeUser);
      
      const result = await authService.login(loginDto);
      
      expect(result).toEqual({
        token: 'jwt_token',
        user: fakeUser._doc
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      
      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const validToken = 'valid_token';
    
    beforeEach(() => {
      (jwtService.verify as jest.Mock).mockReturnValue({ 
        exp: Math.floor(Date.now() / 1000) + 3600 
      });
    });

    it('should blacklist token and return success message', async () => {
      const result = await authService.logout(validToken);

      expect(tokenBlacklistService.blacklistToken).toHaveBeenCalled();
      expect(tokenBlacklistService.removeExpiredTokens).toHaveBeenCalled();
      expect(result).toBe('Successfully logged out');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.logout(validToken))
        .rejects.toThrow(UnauthorizedException);
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
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterAll(() => {
      (console.error as jest.Mock).mockRestore();
    });
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
      expect(result).toEqual('Password updated successfully');
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

      expect(usersService.updatePassword).toHaveBeenCalledWith(
        '123',
        newPassword,
      );
      expect(result).toEqual('Password updated successfully');
    });
  });
});
