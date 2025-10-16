import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { AuthService } from '../auth/auth.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private stripeService: StripeService,
    private authService: AuthService,
  ) {}

  async upgradeSubscription(
    userId: string,
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    try {
      const updatedSubscription = await this.stripeService.updateSubscription(
        subscriptionId,
        updateDto.priceId,
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
      const updatedSubscription = await this.stripeService.updateSubscription(
        subscriptionId,
        updateDto.priceId,
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
        await this.stripeService.cancelSubscription(subscriptionId);

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
