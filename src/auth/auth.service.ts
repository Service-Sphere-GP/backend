import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './../users/users.service';
import { CreateCustomerDto } from './../users/dto/create-customer.dto';
import { CreateServiceProviderDto } from './../users/dto/create-service-provider.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Express } from 'express';
import * as crypto from 'crypto';
import { PasswordResetTokensService } from './password-reset-token.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { MailService } from './../mail/mail.service';
import { OtpService } from './otp.service';
import { User } from './../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // Default profile image URL to be assigned to all new users
  private readonly DEFAULT_PROFILE_IMAGE =
    'https://res.cloudinary.com/ein39/image/upload/v1743629482/ServiceSphere/vryf9jmnqabuoo1c1aab.webp';

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordResetTokenService: PasswordResetTokensService,
    private tokenBlacklistService: TokenBlacklistService,
    private mailService: MailService,
    private otpService: OtpService,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async registerCustomer(createCustomerDto: CreateCustomerDto) {
    const existingUser = await this.usersService.findByEmail(
      createCustomerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    try {
      const customerData = {
        ...createCustomerDto,
        role: 'customer',
        profile_image: this.DEFAULT_PROFILE_IMAGE,
      };
      const customer = await this.usersService.createCustomer(customerData);

      const otp = this.otpService.generateOtp();

      try {
        await this.otpService.saveOtp(customer.id, otp);
      } catch (error) {
        throw new BadRequestException('Failed to save OTP');
      }

      try {
        await this.mailService.sendWelcomeEmail(
          customer.email,
          customer.first_name,
          otp,
        );
      } catch (error) {
        console.log('Error sending email:', error);
        customer.emailSent = false;
      }

      customer.emailSent = customer.emailSent === false ? false : true;
      return customer;
    } catch (error) {
      throw new BadRequestException('Failed to create customer');
    }
  }

  async registerServiceProvider(
    createServiceProviderDto: CreateServiceProviderDto,
  ) {
    const existingUser = await this.usersService.findByEmail(
      createServiceProviderDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    try {
      const serviceProviderData = {
        ...createServiceProviderDto,
        role: 'service_provider',
        profile_image: this.DEFAULT_PROFILE_IMAGE,
      };
      const serviceProvider =
        await this.usersService.createServiceProvider(serviceProviderData);

      const otp = this.otpService.generateOtp();

      try {
        await this.otpService.saveOtp(serviceProvider.id, otp);
      } catch (error) {
        throw new BadRequestException('Failed to save OTP');
      }

      try {
        await this.mailService.sendWelcomeEmail(
          serviceProvider.email,
          serviceProvider.first_name,
          otp,
        );
      } catch (error) {
        console.log('Error sending email:', error);
        serviceProvider.emailSent = false;
      }

      serviceProvider.emailSent =
        serviceProvider.emailSent === false ? false : true;
      return serviceProvider;
    } catch (error) {
      throw new BadRequestException('Failed to create service provider');
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

  async generateToken(user: any) {
    const payload: JwtPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_SECRET,
    });

    return token;
  }

  async login(loginDto: any) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = await this.generateToken(user._doc);
    return { token, user: user._doc };
  }

  async logout(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const expiresAt = new Date(decoded.exp * 1000);

      await this.tokenBlacklistService.blacklistToken(token, expiresAt);

      await this.tokenBlacklistService.removeExpiredTokens();

      return 'Successfully logged out';
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

    try {
      await this.mailService.sendPasswordResetEmail(
        email,
        user.first_name,
        token,
      );
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return 'Reset token generated successfully';
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

    return 'Password updated successfully';
  }

  async verifyEmail(userId: string, otp: string): Promise<void> {
    const isValid = await this.otpService.validateOtp(userId, otp);
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    await this.userModel.findByIdAndUpdate(userId, {
      email_verified: true,
      email_verification_otp: null,
      email_verification_expires: null,
    });
  }

  async resendVerificationOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.otpService.generateOtp();

    try {
      await this.otpService.saveOtp(user._id.toString(), otp);
    } catch (error) {
      throw new BadRequestException('Failed to save OTP');
    }

    try {
      await this.mailService.sendVerificationResendEmail(
        user.email,
        user.first_name,
        otp,
      );
    } catch (error) {
      console.log('Error sending email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification email resent successfully' };
  }

  async registerFirstAdmin(createAdminDto: CreateAdminDto) {
    // Check if any admin users already exist
    try {
      const existingAdmins = await this.usersService.findAllAdmins();

      if (existingAdmins && existingAdmins.length > 0) {
        throw new ForbiddenException(
          'Admin users already exist. This endpoint can only be used when no admin users exist.',
        );
      }

      // Check if email already exists
      const existingUser = await this.usersService.findByEmail(
        createAdminDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      console.log(
        'Creating admin with data:',
        JSON.stringify(createAdminDto, null, 2),
      );

      const adminData = {
        ...createAdminDto,
        role: 'admin',
      };

      const admin = await this.usersService.createAdmin(adminData);
      console.log('Admin created successfully:', admin.id);

      // Generate JWT token for the new admin
      const payload: JwtPayload = {
        sub: admin.id,
        email: admin.email,
        role: 'admin',
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        user: admin,
        access_token: accessToken,
      };
    } catch (error) {
      console.error('Failed to create admin user. Error details:', error);

      // Provide more specific error messages based on the error type
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      } else if (error.code === 11000) {
        throw new BadRequestException(
          'Duplicate key error: Email already exists',
        );
      } else {
        throw new BadRequestException(
          `Failed to create admin user: ${error.message || 'Unknown error'}`,
        );
      }
    }
  }

  async registerAdmin(apiKey: string, createAdminDto: CreateAdminDto) {
    // Validate API key
    const validApiKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new ForbiddenException('Invalid or missing API key');
    }

    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(
      createAdminDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    try {
      const adminData = {
        ...createAdminDto,
        role: 'admin',
      };

      const admin = await this.usersService.createAdmin(adminData);

      return {
        message: 'Admin user created successfully',
        user: admin,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create admin user');
    }
  }
}
