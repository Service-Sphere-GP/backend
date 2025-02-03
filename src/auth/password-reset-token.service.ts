import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PasswordResetToken } from './schemas/password-reset-token.schema';

@Injectable()
export class PasswordResetTokensService {
  constructor(
    @InjectModel(PasswordResetToken.name)
    private readonly passwordResetTokenModel: Model<PasswordResetToken>,
  ) {}

  async createToken(user_id: string, token: string, expires_at: Date) {
    await this.passwordResetTokenModel.create({
      user_id,
      token,
      expires_at,
    });
  }

  async findByToken(token: string) {
    return this.passwordResetTokenModel.findOne({ token }).exec();
  }

  async deleteToken(id: string) {
    await this.passwordResetTokenModel.findByIdAndDelete(id).exec();
  }

  async deleteAllTokensForUser(user_id: string) {
    await this.passwordResetTokenModel.deleteMany({ user_id }).exec();
  }
}
