import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { OtpService } from './otp.service';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register/customer')
  async registerCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.authService.registerCustomer(createCustomerDto);
  }

  @Post('register/service-provider')
  async registerServiceProvider(
    @Body() createServiceProviderDto: CreateServiceProviderDto,
  ) {
    return this.authService.registerServiceProvider(createServiceProviderDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() body?: { refreshToken?: string }) {
    if (body?.refreshToken) {
      return this.authService.logout(body.refreshToken);
    }
    // If no refresh token provided, just return success message
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    try {
      await this.authService.generatePasswordResetToken(email);
    } catch (error) {
      throw new BadRequestException('token generation failed');
    }
    return 'Reset token generated successfully';
  }

  @Patch('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    if (resetPasswordDto.new_password !== resetPasswordDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }
    return this.authService.resetPassword(token, resetPasswordDto.new_password);
  }

  @Post('verify-email/:userId')
  async verifyEmailWithUserId(
    @Param('userId') userId: string,
    @Body() body: { otp: string },
  ) {
    try {
      await this.authService.verifyEmail(userId, body.otp);
      return {
        message:
          'Email verified successfully. You can now log in to your account.',
        verified: true,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('verification-status/:email')
  async getVerificationStatus(@Param('email') email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return {
        email: user.email,
        email_verified: user.email_verified,
        user_id: user._id,
        role: user.role,
        message: user.email_verified
          ? 'Email is already verified'
          : 'Email verification required',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('resend-verification')
  async resendVerificationOtp(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationOtp(resendVerificationDto.email);
  }

  @Post('register/first-admin')
  async registerFirstAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.registerFirstAdmin(createAdminDto);
  }

  @Post('register/admin')
  async registerAdmin(
    @Headers('x-api-key') apiKey: string,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    return this.authService.registerAdmin(apiKey, createAdminDto);
  }
}
