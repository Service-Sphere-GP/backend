import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenBlacklist } from './schemas/token-blacklist.schema';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(TokenBlacklist.name)
    private tokenBlacklistModel: Model<TokenBlacklist>,
  ) {}

  async blacklistToken(token: string, expiresAt: Date): Promise<void> {
    await this.tokenBlacklistModel.create({ token, expiresAt });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistModel.findOne({ token });
    return !!blacklistedToken;
  }

  async removeExpiredTokens(): Promise<void> {
    await this.tokenBlacklistModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}