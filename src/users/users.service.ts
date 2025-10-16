import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    private stripeService: StripeService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, priceId } = createUserDto;

    try {
      // Create Stripe customer first
      const stripeCustomer = await this.stripeService.createCustomer(email, {
        firstName,
        lastName,
      });

      // Create subscription if priceId is provided
      let subscription: any = null;
      if (priceId) {
        subscription = await this.stripeService.createSubscription(
          stripeCustomer.id,
          priceId,
        );
      }

      // Create Auth0 user with Stripe metadata
      const auth0User = {
        user_id: "",
        email: "",
      }

      return {
        userId: auth0User.user_id,
        email: auth0User.email,
        stripeCustomerId: stripeCustomer.id,
        subscriptionId: subscription?.id,
        subscription: subscription,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
