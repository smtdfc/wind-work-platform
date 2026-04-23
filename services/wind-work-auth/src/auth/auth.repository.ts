import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_PROVIDER } from '../common/prisma/index.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';

// export type AuthMethod = 'PASSWORD';

@Injectable()
export class AuthenticationMethodRepository {
  constructor(@Inject(PRISMA_PROVIDER) private db: PrismaClient) {}
}

@Injectable()
export class SessionRepository {
  constructor(@Inject(PRISMA_PROVIDER) private db: PrismaClient) {}

  async create(
    id: string,
    refreshToken: string,
    expiresAt: string | Date,
    userId: string,
    authenticationMethodId: string,
  ) {
    return this.db.session.create({
      data: {
        id,
        refreshToken,
        expiresAt,
        user: { connect: { id: userId } },
        method: { connect: { id: authenticationMethodId } },
      },
    });
  }

  async updateTokenById(
    id: string,
    refreshToken: string,
    expiresAt: string | Date,
  ) {
    return this.db.session.update({
      where: {
        id: id,
      },
      data: {
        refreshToken: refreshToken,
        expiresAt: expiresAt,
      },
    });
  }

  async update(id: string, data: Prisma.SessionUpdateInput) {
    return this.db.session.update({
      where: { id },
      data,
    });
  }

  async findById(id: string) {
    return this.db.session.findUnique({
      where: { id },
    });
  }

  async updateRotation(
    id: string,
    data: { oldRefreshToken: string; newRefreshToken: string; expiresAt: Date },
  ) {
    return this.db.session.update({
      where: { id },
      data: {
        oldRefreshToken: data.oldRefreshToken,
        refreshToken: data.newRefreshToken,
        expiresAt: data.expiresAt,
        replacedAt: new Date(),
      },
    });
  }

  async blockAllByUserId(userId: string): Promise<void> {
    await this.db.session.updateMany({
      where: {
        userId: userId,
        isBlocked: false,
      },
      data: {
        isBlocked: true,
      },
    });
  }
}
