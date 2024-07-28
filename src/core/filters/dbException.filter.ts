import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Default error message and status code
    let message = 'Database operation failed';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // Check if exception has a driverError property with code
    if (
      exception.driverError &&
      typeof exception.driverError === 'object' &&
      'code' in exception.driverError
    ) {
      const driverError = exception.driverError as { code: string };

      // Determine the specific error message and status code based on the error
      switch (driverError.code) {
        case 'ER_DUP_ENTRY':
          message = 'A record with this unique value already exists';
          statusCode = HttpStatus.CONFLICT;
          break;
        case 'ER_NO_REFERENCED_ROW_2':
          message = 'Referenced record not found';
          statusCode = HttpStatus.NOT_FOUND;
          break;
        case 'ER_ROW_IS_REFERENCED_2':
          message = 'Record is referenced by another record';
          statusCode = HttpStatus.BAD_REQUEST;
          break;
        case 'ER_BAD_NULL_ERROR':
          message = 'Null value in a non-nullable column';
          statusCode = HttpStatus.BAD_REQUEST;
          break;
        default:
          message = 'Database operation failed';
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
      }
    }

    // Log the error if needed (optional)
    console.error('Database Exception:', exception);

    // Send the response
    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
