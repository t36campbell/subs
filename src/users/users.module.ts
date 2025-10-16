import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [AuthModule, StripeModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
