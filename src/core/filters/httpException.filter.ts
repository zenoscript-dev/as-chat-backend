import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const msg = exception.getResponse();

    const responseBody = {
      success: false,
      statusCode: status,
      message: msg,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    const statusCode = status >= 1000 ? 200 : status;

    this.logger.error(
      ' error for path : ' +
        responseBody.path +
        ' with status code : ' +
        responseBody.statusCode +
        ' timestamp : ' +
        responseBody.timestamp,
    );
    this.logger.error('exception : ', exception);
    response.status(statusCode).json(responseBody);
  }
}
