export interface IAuthTokenPayload {
  sub: string;
  sid: string;
  exp: number;
}

export interface IAuthTokenDecrypted {
  id: string;
}
