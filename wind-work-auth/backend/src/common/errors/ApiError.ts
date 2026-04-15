import { HttpStatus } from '@nestjs/common';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: HttpStatus = 400,
    public code: string = 'UNKNOWN_ERR',
    public details: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
