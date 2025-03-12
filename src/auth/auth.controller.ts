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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('register/customer')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully.',
  })
  async registerCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.authService.registerCustomer(createCustomerDto);
  }

  @Post('register/service-provider')
  @ApiOperation({ summary: 'Register a new service provider' })
  @ApiResponse({
    status: 201,
    description: 'Service provider registered successfully.',
  })
  async registerServiceProvider(
    @Body() createServiceProviderDto: CreateServiceProviderDto,
  ) {
    return this.authService.registerServiceProvider(createServiceProviderDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(BlacklistedJwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authorization.split(' ')[1];
    return this.authService.logout(token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Generate password reset token' })
  @ApiResponse({ status: 200, description: 'Reset token generated' })
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    try {
      await this.authService.generatePasswordResetToken(email);
    } catch (error) {
      throw new BadRequestException('token generation failed');
    }
    return 'Reset token generated successfully';
  }

  @Patch('reset-password/:token')
  @ApiOperation({ summary: 'Reset password with token' })
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
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  async verifyEmail(
    @Param('userId') userId: string,
    @Body() body: { otp: string },
  ) {
    console.log('body', body);
    console.log('userId', userId);
    return this.authService.verifyEmail(userId, body.otp);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification OTP' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or invalid request',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendVerificationOtp(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationOtp(resendVerificationDto.email);
  }

  @Post('register/first-admin')
  @ApiOperation({
    summary: 'Register the first admin user (works only when no admins exist)',
    description:
      'This endpoint allows creating the very first admin user in the system. It only works when there are no existing admin users. After the first admin is created, this endpoint will return a 403 error.',
  })
  @ApiResponse({
    status: 201,
    description: 'First admin registered successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin users already exist.',
  })
  @ApiBody({
    type: CreateAdminDto,
    examples: {
      createFirstAdminExample: {
        summary: 'Example JSON payload',
        value: {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          password: 'securePassword123',
          confirm_password: 'securePassword123',
          permissions: ['manage_users', 'manage_services', 'manage_all'],
        },
      },
    },
  })
  async registerFirstAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.registerFirstAdmin(createAdminDto);
  }

  @Post('register/admin')
  @ApiOperation({
    summary: 'Register an admin user using API key authentication',
    description:
      'This endpoint allows creating additional admin users. It requires a valid API key to be provided in the x-api-key header. The API key should be set in the ADMIN_API_KEY environment variable.',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin registered successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or missing API key.',
  })
  @ApiBody({
    type: CreateAdminDto,
    examples: {
      createAdminExample: {
        summary: 'Example JSON payload',
        value: {
          first_name: 'Another',
          last_name: 'Admin',
          email: 'another.admin@example.com',
          password: 'securePassword456',
          confirm_password: 'securePassword456',
          permissions: ['manage_users', 'manage_services'],
        },
      },
    },
  })
  async registerAdmin(
    @Headers('x-api-key') apiKey: string,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    return this.authService.registerAdmin(apiKey, createAdminDto);
  }
}
