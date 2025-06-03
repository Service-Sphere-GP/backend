import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private refreshTokenService: RefreshTokenService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredTokenCleanup() {
    this.logger.log('Starting expired token cleanup...');
    try {
      await this.refreshTokenService.removeExpiredTokens();
      this.logger.log('Expired tokens cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens', error);
    }
  }
}
