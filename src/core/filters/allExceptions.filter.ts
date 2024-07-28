import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // console.log("sadsaasdd",exception instanceof HttpException, exception.status)
    this.logger.error(`Handling AllExceptionsFilter: ${exception.message}`);
    this.logger.error(
      `Error for path: ${request.url}, Status: ${status}, Timestamp: ${new Date().toISOString()}`,
    );
    const responseBody = {
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!response.headersSent) {
      httpAdapter.reply(response, responseBody, status);
    }
  }
}
