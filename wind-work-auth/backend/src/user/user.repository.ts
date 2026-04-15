import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_PROVIDER } from '../common/prisma/index.js';
import { PrismaClient, User } from '../generated/prisma/client.js';

@Injectable()
export class UserRepository {
  constructor(@Inject(PRISMA_PROVIDER) private db: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { email },
    });
  }

  async findUserByID(id: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { id },
    });
  }

  async findForSignIn(email: string) {
    return this.db.user.findFirst({
      where: {
        email,
        authMethods: {
          some: { method: 'PASSWORD' },
        },
      },
      include: { authMethods: true },
    });
  }
}
