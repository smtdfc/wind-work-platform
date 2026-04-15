/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

interface IObject {
  validate(): void;
}

@Injectable()
export class ValidationPipe<T extends IObject> implements PipeTransform {
  transform(value: T, metadata: ArgumentMetadata) {
    const { metatype } = metadata as any;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = metatype.fromJson(JSON.stringify(value)) as T;
    if (typeof object.validate === "function") {
      try {
        object.validate();
      } catch (e) {
        throw e;
      }
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
