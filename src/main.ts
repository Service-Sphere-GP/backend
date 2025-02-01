import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { JsendExceptionFilter } from './common/filters/jsend-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
        in: 'header'
      },
      'access-token'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
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

  // Use morgan for logging
  app.use(morgan('dev'));

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new JsendExceptionFilter(configService));

  await app.listen(3000);
}
bootstrap();
