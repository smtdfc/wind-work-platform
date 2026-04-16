import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IAuthTokenDecrypted } from "../types/jwt.js";
import { throwErrorFromContract } from "@wind-work/contractor-for-nestjs";
import { AuthorizationError } from "@wind-work/contracts/wind-work-auth";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = IAuthTokenDecrypted>(err: any, user: any): TUser {
    if (err || !user) {
      throwErrorFromContract(AuthorizationError, {});
    }

    return user as TUser;
  }
}
