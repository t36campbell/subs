import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-09-30.clover',
      },
    );
  }

  async createCustomer(email: string, metadata: any = {}) {
    try {
      return await this.stripe.customers.create({
        email,
        metadata,
      });
    } catch (error: any) {
      throw new HttpException(
        'Failed to create Stripe customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createSubscription(customerId: string, priceId: string) {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error: any) {
      throw new HttpException(
        'Failed to create subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      return await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
    } catch (error: any) {
      throw new HttpException(
        'Failed to update subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error: any) {
      throw new HttpException(
        'Failed to cancel subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error: any) {
      throw new HttpException(
        'Failed to retrieve subscription',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
