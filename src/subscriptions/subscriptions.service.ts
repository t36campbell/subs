import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Subscription } from './subscriptions.models';
import Stripe from 'stripe';
import { Redis } from 'ioredis';
import { Management, ManagementClient } from 'auth0';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('AUTH0') private auth0: ManagementClient,
    @Inject('STRIPE') private stripe: Stripe,
    @Inject('REDIS') private redis: Redis,
  ) {}

  async retrieve(
    uid: string,
    sid: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    return await this.stripe.subscriptions.retrieve(sid);
  }

  async resume(
    uid: string,
    sid: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const sub =  await this.stripe.subscriptions.resume(sid);
    this.update_user(uid, {})
    return sub
  }

  async upsert(
    uid: string,
    sid: string,
    subscription: Subscription,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    // TODO: get subscription from redis with uid 
    const s = this.redis.getex('')

    const sub = await this.stripe.subscriptions.update(sid, {
      items: [{ price: subscription.priceId }],
    });

    this.update_user(uid, {})

    return sub;
  }

  async cancel(
    uid: string,
    sid: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const sub = await this.stripe.subscriptions.cancel(sid);
    this.update_user(uid, {})

    return sub;
  }

  private async update_user(uid: string, obj: Management.UpdateUserRequestContent = { app_metadata: {}, user_metadata: {} }) {
    this.auth0.users.update(uid, obj)
  }
}
