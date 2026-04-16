import { Module } from '@nestjs/common';
import * as AuthService from '@wind-work/auth-service';
import { ConfigModule, DbAdapterModule } from '@wind-work/common';
@Module({
  imports: [ConfigModule, DbAdapterModule, AuthService.AppModule],
})
export class AppModule {}
