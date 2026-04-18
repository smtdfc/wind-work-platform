export interface IAuthTokenPayload {
  sub: string;
  sid: string;
}

export interface IAuthTokenDecrypted {
  id: string;
}
