import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TokenBlacklistService } from './../token-blacklist.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class BlacklistedJwtAuthGuard extends JwtAuthGuard {
  private tokenBlacklistService: TokenBlacklistService;

  constructor(private moduleRef: ModuleRef) {
    super();
  }

  async onModuleInit() {
    this.tokenBlacklistService = this.moduleRef.get(TokenBlacklistService, { strict: false });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Please login to access this resource.');
    }

    try {
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Session expired or logged out. Please login again to continue.');
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException('Authentication failed. Please login again to continue.');
    }
  }
}