import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';

import { PasswordResetTokensService } from './password-reset-token.service';

import { TokenBlacklist, TokenBlacklistSchema } from './schemas/token-blacklist.schema';
import { TokenBlacklistService } from './token-blacklist.service';
import { BlacklistedJwtAuthGuard } from './guards/blacklisted-jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema},
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PasswordResetTokensService,
    TokenBlacklistService,
    BlacklistedJwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, TokenBlacklistService,BlacklistedJwtAuthGuard],
})
export class AuthModule {}
