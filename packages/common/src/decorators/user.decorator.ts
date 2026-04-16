import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IAuthTokenDecrypted } from "../types/jwt.js";

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: IAuthTokenDecrypted }>();
    const user = request.user;
    const result = data ? user?.[data as keyof IAuthTokenDecrypted] : user;
    return result as unknown;
  },
);
