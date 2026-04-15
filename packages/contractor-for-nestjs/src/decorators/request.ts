import { Get, Post, Put, Delete, RequestMethod } from "@nestjs/common";

export interface IRequestMetadata {
  path: string;
  method: string;
}

export function RequestFromContract(
  metadata: IRequestMetadata,
): MethodDecorator {
  switch (metadata.method) {
    case "GET":
      return Get(metadata.path);
    case "POST":
      return Post(metadata.path);
    case "PUT":
      return Put(metadata.path);
    case "DELETE":
      return Delete(metadata.path);
    default:
      return Get(metadata.path);
  }
}
