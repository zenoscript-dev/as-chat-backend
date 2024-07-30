import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'winston-daily-rotate-file';

import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as cors from 'cors';
import { urlencoded, json } from 'express';
import { HttpExceptionFilter } from './core/filters/httpException.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response.transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize({ all: true }),
            nestWinstonModuleUtilities.format.nestLike('team-chat', {
              // options
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('team-chat', {
              // options
            }),
          ),
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('team-chat', {
              // options
            }),
          ),
          filename: 'logs/application-error-%DATE%.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
        }),
      ],
      // other options
    }),
  });

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('team-chat')
    .setDescription('Project team chat description')
    .setVersion('1.0')
    // .addTag('auth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.setGlobalPrefix('api/v1');

  app.use(json({ limit: '30mb' }));
  app.use(urlencoded({ extended: true, limit: '30mb' }));
  app.use(
    cors({
      origin: 'http://localhost:8081',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalFilters(new DbExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3300);
}
bootstrap();
