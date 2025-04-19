import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Headers,
  BadRequestException,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { LoginDto } from './dto/login.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { BlacklistedJwtAuthGuard } from './guards/blacklisted-jwt-auth.guard';
import { CurrentUser } from './../common/decorators/current-user.decorator';
import { OtpService } from './otp.service';
import { CreateAdminDto } from '../users/dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
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

  @Post('logout')
  @UseGuards(BlacklistedJwtAuthGuard)
  async logout(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authorization.split(' ')[1];
    return this.authService.logout(token);
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
  async verifyEmail(
    @Param('userId') userId: string,
    @Body() body: { otp: string },
  ) {
    console.log('body', body);
    console.log('userId', userId);
    return this.authService.verifyEmail(userId, body.otp);
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
