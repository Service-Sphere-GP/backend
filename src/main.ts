import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { JsendExceptionFilter } from './common/filters/jsend-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { JsendResponseInterceptor } from './common/interceptors/jsend-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1', {
    exclude: ['docs'],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Service Sphere API Documentation')
    .setDescription(
      'We hope that this API documentation will help you understand the Service Sphere API and not wonder why does life even matter.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Services', 'Service management endpoints')
    .addTag('Bookings', 'Service booking management endpoints')
    .addTag('Feedback', 'User feedback management endpoints')
    .addTag('Tickets', 'Support ticket management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Add tag groups for better organization
  const options = {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      persistAuthorization: true,
      tagGroups: [
        {
          name: 'Authentication & User Management',
          tags: ['Authentication', 'Users'],
        },
        {
          name: 'Service Management',
          tags: ['Services', 'Bookings'],
        },
        {
          name: 'Customer Support',
          tags: ['Feedback', 'Tickets'],
        },
      ],
    },
  };

  SwaggerModule.setup('docs', app, document, options);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
      validationError: { target: false },
    }),
  );

  app.use(morgan('dev'));

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new JsendExceptionFilter(configService));
  app.useGlobalInterceptors(new JsendResponseInterceptor());

  // Use the PORT environment variable provided by Heroku
  const port = process.env.PORT || 3000;
  await app.listen(port);

}
bootstrap();
