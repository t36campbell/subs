import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Global()
@Module({
  providers: [
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET', 'supersecret'), {
          apiVersion: '2025-09-30.clover',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STRIPE'],
})
export class StripeModule {}
