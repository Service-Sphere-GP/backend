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
}
