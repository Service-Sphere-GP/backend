import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class JsendResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        data,
      })),
    );
  }
}