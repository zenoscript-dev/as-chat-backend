import {
  CallHandler,
  Catch,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';

interface IError {
  statusCode?: number;
  message: string | object;
  success: boolean;
}

@Injectable()
@Catch(HttpException) // Only catch HttpExceptions
export class GlobalErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        let errorResponse: IError = {
          success: false,
          message: 'Internal Server Error',
        };

        if (error instanceof HttpException) {
          errorResponse = {
            success: false,
            message: error.getResponse(),
            statusCode: error.getStatus(),
          }; // Extract details from HttpException
        } else {
          // Handle non-HttpException errors (optional)
          errorResponse.success = false;
          console.error('Unhandled Error:', error); // Log the unexpected error
          errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        response
          .status(errorResponse.statusCode || HttpStatus.INTERNAL_SERVER_ERROR)
          .json(errorResponse);
        return throwError(() => error); // Throw the original error to stop further processing
      }),
    );
  }
}
