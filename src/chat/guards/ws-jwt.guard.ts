import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      this.logger.warn(`No token provided from client: ${client.id}`);
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`User not found for token from client: ${client.id}`);
        client.disconnect();
        return false;
      }

      client.data.user = {
        userId: user['_id'],
        role: user['role'],
        email: user['email'],
      };

      return true;
    } catch (err) {
      this.logger.error(
        `Authentication error for client ${client.id}: ${err.message}`,
      );
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    if (client.handshake.headers.authorization) {
      const authHeader = client.handshake.headers.authorization.toString();
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }

    if (client.handshake.headers.token) {
      return client.handshake.headers.token as string;
    }

    if (client.handshake.query && client.handshake.query.token) {
      return client.handshake.query.token as string;
    }

    return null;
  }
}
