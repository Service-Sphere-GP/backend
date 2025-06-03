import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';

import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';

import { PasswordResetTokensService } from './password-reset-token.service';

import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { RefreshTokenService } from './refresh-token.service';
import { TokenCleanupService } from './token-cleanup.service';
import { OtpService } from './otp.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    ConfigModule,
    MailModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PasswordResetTokensService,
    RefreshTokenService,
    TokenCleanupService,
    OtpService,
  ],
  controllers: [AuthController],
  exports: [AuthService, RefreshTokenService],
})
export class AuthModule {}
