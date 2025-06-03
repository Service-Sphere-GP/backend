import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Enforce email verification for non-admin users
    if (!user.email_verified && user.role !== 'admin') {
      throw new ForbiddenException({
        message:
          'Email verification required. Please verify your email to access this resource.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
        userId: user._id,
      });
    }

    return {
      user_id: payload.sub,
      email: payload.email,
      role: payload.role,
      email_verified: user.email_verified,
    };
  }
}
