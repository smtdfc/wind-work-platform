import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_PROVIDER, type Config } from "../config/index.js";
import { IAuthTokenDecrypted, IAuthTokenPayload } from "../types/jwt.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(CONFIG_PROVIDER) private config: Config) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtPublicKey,
      algorithms: ["RS256"],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: IAuthTokenPayload): Promise<IAuthTokenDecrypted> {
    return { id: payload.sub };
  }
}
