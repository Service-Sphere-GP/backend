import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class OtpService {
  private readonly MAX_OTP_ATTEMPTS = 5;
  private readonly OTP_COOLDOWN_MINUTES = 2;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOtp(userId: string, otp: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      user.email_verification_expires &&
      new Date() < user.email_verification_expires
    ) {
      const lastAttempt = user.email_verification_expires;
      const cooldownEnd = new Date(
        lastAttempt.getTime() -
          15 * 60 * 1000 +
          this.OTP_COOLDOWN_MINUTES * 60 * 1000,
      );

      if (new Date() < cooldownEnd) {
        const remainingTime = Math.ceil(
          (cooldownEnd.getTime() - new Date().getTime()) / 60000,
        );
        throw new BadRequestException(
          `Please wait ${remainingTime} minutes before requesting a new OTP`,
        );
      }
    }

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.userModel.findByIdAndUpdate(userId, {
      email_verification_otp: otp,
      email_verification_expires: expires,
      otp_attempts: 0, // Reset attempts when new OTP is generated
    });
  }

  async validateOtp(userId: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || user.email_verification_otp !== otp) {
      // Increment failed attempts
      if (user) {
        const attempts = (user.otp_attempts || 0) + 1;
        await this.userModel.findByIdAndUpdate(userId, {
          otp_attempts: attempts,
        });

        if (attempts >= this.MAX_OTP_ATTEMPTS) {
          // Invalidate OTP after max attempts
          await this.userModel.findByIdAndUpdate(userId, {
            email_verification_otp: null,
            email_verification_expires: null,
            otp_attempts: 0,
          });
          throw new BadRequestException(
            'Too many failed attempts. Please request a new OTP.',
          );
        }
      }
      return false;
    }

    const isValid = new Date() < user.email_verification_expires;

    if (!isValid) {
      // Clean up expired OTP
      await this.userModel.findByIdAndUpdate(userId, {
        email_verification_otp: null,
        email_verification_expires: null,
        otp_attempts: 0,
      });
    }

    return isValid;
  }
}
