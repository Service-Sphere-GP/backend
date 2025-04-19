import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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

  app.setGlobalPrefix('api/v1');

  app.use(morgan('dev'));

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new JsendExceptionFilter(configService));
  app.useGlobalInterceptors(new JsendResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: { target: false },
    }),
  );

  // Use the PORT environment variable provided by Heroku
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
