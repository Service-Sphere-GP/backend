import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from './../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        status: 'error',
        message: 'Insufficient permissions to access this resource',
        data: {
          requiredRoles: requiredRoles,
          userRole: user.role
        }
      });
    }
    return true;
  }
}