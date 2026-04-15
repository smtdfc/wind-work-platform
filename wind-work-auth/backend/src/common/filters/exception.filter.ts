import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiError } from '../errors/ApiError.js';
import {
  ApiErrorResponseDTO,
  ApiResponseDTO,
  ValidationError,
} from '@wind-work/contracts/wind-work-auth';
import { ContractError } from '@wind-work/contractor-for-nestjs';
import { Request, Response } from 'express';

interface NestHttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let details: Record<string, string[]> = {};
    let code = 'SERVER_ERR';

    if (exception instanceof ApiError) {
      message = exception.message;
      details = exception.details;
      status = exception.status;
      code = exception.code;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      details = exception.errors;
      code = 'VALIDATE_ERR';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as NestHttpExceptionResponse;
      code = 'HTTP_ERR';
      if (typeof res === 'string') {
        message = res;
      } else {
        const rawMessage = Array.isArray(res.message)
          ? res.message[0]
          : res.message;
        message = rawMessage ?? 'Unknown error';
      }
    } else if (exception instanceof ContractError) {
      message = exception.message;
      details = exception.details;
      status = exception.status;
      code = exception.code;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Client Error: ${message}`,
      );
    }

    response.status(status).json(
      new ApiResponseDTO({
        status: 'error',
        timestamp: String(Date.now()),
        data: null,
        error: new ApiErrorResponseDTO({ code, message, details }),
      }),
    );
  }
}
