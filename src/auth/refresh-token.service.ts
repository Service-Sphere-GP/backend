import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async storeRefreshToken(user_id: string, token: string) {
    await this.refreshTokenModel.create({
      user_id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  async validateRefreshToken(user_id: string, token: string) {
    const storedToken = await this.refreshTokenModel.findOne({
      user_id,
      token,
      expires_at: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenModel.deleteOne({ _id: storedToken._id });
  }

  async invalidateRefreshTokens(user_id: string) {
    await this.refreshTokenModel.deleteMany({ user_id });
  }
}
