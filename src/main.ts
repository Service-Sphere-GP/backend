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
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('app.corsOrigin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  app.use(morgan('dev'));

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

  // Use ConfigService instead of direct env access
  const port = configService.get<number>('app.port');
  await app.listen(port);
}
bootstrap();
