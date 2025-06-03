import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async createRefreshToken(userId: string, expiresAt: Date): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel
      .findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenModel.updateOne({ token }, { isRevoked: true });
  }

  async removeExpiredTokens(): Promise<void> {
    await this.refreshTokenModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
    });
  }

  async isValidRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    return !!refreshToken;
  }
}
