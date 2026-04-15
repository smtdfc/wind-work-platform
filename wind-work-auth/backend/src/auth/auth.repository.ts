import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_PROVIDER } from '../common/prisma/index.js';
import { PrismaClient } from '../generated/prisma/client.js';

export type AuthMethod = 'PASSWORD';

@Injectable()
export class AuthenticationMethodRepository {
  constructor(@Inject(PRISMA_PROVIDER) private db: PrismaClient) {}
}

@Injectable()
export class SessionRepository {
  constructor(@Inject(PRISMA_PROVIDER) private db: PrismaClient) {}

  async create(
    refreshToken: string,
    expiresAt: string | Date,
    userId: string,
    authenticationMethodId: string,
  ) {
    return await this.db.session.create({
      data: {
        refreshToken,
        expiresAt,
        user: { connect: { id: userId } },
        method: { connect: { id: authenticationMethodId } },
      },
    });
  }
}
