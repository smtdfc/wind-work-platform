import { Controller, Get, Req, Res } from '@nestjs/common';
import { type FastifyReply, type FastifyRequest } from 'fastify';

@Controller('security')
export class SecurityController {
  @Get('csrf-token')
  getCsrfToken(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = (res as any).generateCsrf();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { csrfToken: token };
  }
}
