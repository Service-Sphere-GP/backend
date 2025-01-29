import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class JsendExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    // Determine the environment
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    const isProduction = nodeEnv === 'production';

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // Base details for all environments
    const responseDetails: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle different types of exception responses
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        if ((exceptionResponse as any).message) {
          message = (exceptionResponse as any).message;
        }

        // If there are additional details (e.g., validation errors), include them
        if ((exceptionResponse as any).errors) {
          responseDetails.errors = (exceptionResponse as any).errors;
        } else if (Array.isArray((exceptionResponse as any).message)) {
          responseDetails.errors = (exceptionResponse as any).message;
        }
      }
    }

    // Construct JSend response based on the environment and status code
    if (status >= 400 && status < 500) {
      // Fail responses for client errors
      responseDetails.message = message;

      if (!isProduction && exception instanceof HttpException) {
        // Include stack trace in development for easier debugging
        responseDetails.stack = exception.stack;
      }

      response.status(status).json({
        status: 'fail',
        data: responseDetails,
      });
    } else {
      // Error responses for server errors
      const errorResponse: any = {
        status: 'error',
        message: 'Internal server error',
      };

      if (!isProduction) {
        // Include stack trace and error details in development
        errorResponse.error = message;
        errorResponse.stack = (exception as any).stack;
      }

      response.status(status).json(errorResponse);
    }
  }
}