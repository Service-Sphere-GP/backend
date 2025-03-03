import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOtp(userId: string, otp: string): Promise<void> {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.userModel.findByIdAndUpdate(userId, {
      email_verification_otp: otp,
      email_verification_expires: expires,
    });
  }

  async validateOtp(userId: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || user.email_verification_otp !== otp) return false;
    
    return new Date() < user.email_verification_expires;
  }
}