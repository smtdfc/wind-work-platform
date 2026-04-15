import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ApiResponseDTO } from '@wind-work/contracts/wind-work-auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDTO<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDTO<T>> {
    return next.handle().pipe(
      map(
        (data: T) =>
          new ApiResponseDTO({
            status: 'success',
            timestamp: String(Date.now()),
            data,
          }),
      ),
    );
  }
}
