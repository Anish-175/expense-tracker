import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const err = exception as any;

      // 💥 Handle PostgreSQL unique violation error
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate value violates unique constraint';
      }
      // ❓ Handle other DB-specific errors if needed
    }

    this.logger.error(
      `[${request.method}] ${request.url} → ${status} | ${JSON.stringify(message)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
