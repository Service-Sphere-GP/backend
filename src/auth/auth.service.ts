import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './../users/users.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { RefreshTokensService } from './refresh-token.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import * as crypto from 'crypto';
import { PasswordResetTokensService } from './password-reset-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokensService,
    private passwordResetTokenService: PasswordResetTokensService,
  ) {}

  async registerCustomer(createCustomerDto: CreateCustomerDto) {
    const existingUser = await this.usersService.findByEmail(
      createCustomerDto.email,
    );
    if (existingUser) {
      return {
        status: 'fail',
        data: {
          email: 'Email already exists',
        },
      };
    }

    const customerData = {
      ...createCustomerDto,
      role: 'customer',
    };

    try {
      const customer = await this.usersService.createCustomer(customerData);
      return {
        status: 'success',
        data: customer,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create customer',
        code: 400,
      };
    }
  }

  async registerServiceProvider(
    createServiceProviderDto: CreateServiceProviderDto,
  ) {
    const existingUser = await this.usersService.findByEmail(
      createServiceProviderDto.email,
    );
    if (existingUser) {
      return {
        status: 'fail',
        data: {
          email: 'Email already exists',
        },
      };
    }

    const serviceProviderData = {
      ...createServiceProviderDto,
      role: 'service_provider',
    };

    try {
      const serviceProvider =
        await this.usersService.createServiceProvider(serviceProviderData);
      return {
        status: 'success',
        data: serviceProvider,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create service provider',
        code: 400,
      };
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userData } = user;
    return userData;
  }

  async generateTokens(user: any) {
    const accessPayload: JwtPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(accessPayload, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        secret: process.env.JWT_SECRET,
      }),
      this.jwtService.sign(refreshPayload, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);
    await this.refreshTokenService.storeRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user_id: user._id,
      user_role: user.role,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      await this.refreshTokenService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(loginDto: any) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return {
        status: 'fail',
        data: {
          message: 'Invalid email or password',
        },
      };
    }
    const tokens = await this.generateTokens(user._doc);
    return {
      status: 'success',
      data: {
        tokens,
        user: user._doc,
      },
    };
  }

  async logout(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });
      await this.refreshTokenService.invalidateRefreshTokens(payload.sub);
      return {
        status: 'success',
        message: 'Successfully logged out',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generatePasswordResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.passwordResetTokenService.deleteAllTokensForUser(
      user._id.toString(),
    );

    const token = crypto.randomBytes(20).toString('hex');
    const expires_at = new Date(Date.now() + 3600000);

    await this.passwordResetTokenService.createToken(
      user._id.toString(),
      token,
      expires_at,
    );

    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.passwordResetTokenService.findByToken(token);

    if (!resetToken) throw new UnauthorizedException('Invalid token');
    if (resetToken.expires_at < new Date()) {
      await this.passwordResetTokenService.deleteToken(
        resetToken._id.toString(),
      );
      throw new UnauthorizedException('Expired token');
    }

    const user = await this.usersService.findById(
      resetToken.user_id.toString(),
    );
    if (!user) {
      await this.passwordResetTokenService.deleteToken(
        resetToken._id.toString(),
      );
      throw new NotFoundException('User not found');
    }

    await this.usersService.updatePassword(user._id.toString(), newPassword);

    try {
      await this.passwordResetTokenService.deleteToken(
        resetToken._id.toString(),
      );
    } catch (error) {
      console.error('Token deletion error:', error);
    }

    return { status: 'success', message: 'Password updated successfully' };
  }
}
