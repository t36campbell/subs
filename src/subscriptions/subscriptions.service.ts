import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { AuthService } from '../auth/auth.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('STRIPE') private stripe: Stripe,
    private authService: AuthService,
  ) {}

  async upgradeSubscription(
    userId: string,
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    try {
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          items: [{ price: updateDto.priceId }],
        },
      );

      // Update Auth0 metadata
      // await this.authService.updateUserMetadata(userId, {
      //   subscriptionStatus: updatedSubscription.status,
      //   subscriptionPlan: updateDto.priceId,
      // });

      return {
        message: 'Subscription upgraded successfully',
        subscription: updatedSubscription,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to upgrade subscription',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async downgradeSubscription(
    userId: string,
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    try {
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          items: [{ price: updateDto.priceId }],
        },
      );

      // Update Auth0 metadata
      // await this.authService.updateUserMetadata(userId, {
      //   subscriptionStatus: updatedSubscription.status,
      //   subscriptionPlan: updateDto.priceId,
      // });

      return {
        message: 'Subscription downgraded successfully',
        subscription: updatedSubscription,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to downgrade subscription',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    try {
      const canceledSubscription =
        await this.stripe.subscriptions.cancel(subscriptionId);

      // Update Auth0 metadata
      // await this.authService.updateUserMetadata(userId, {
      //   subscriptionStatus: 'canceled',
      //   subscriptionId: null,
      // });

      return {
        message: 'Subscription canceled successfully',
        subscription: canceledSubscription,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to cancel subscription',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
