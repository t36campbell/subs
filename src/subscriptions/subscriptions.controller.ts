import {
  Controller,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
// @UseGuards(AuthGuard('jwt')) // Uncomment when Auth0 JWT strategy is configured
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Put(':subscriptionId/upgrade')
  async upgradeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() updateDto: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    // When auth is enabled, use: req.user.sub
    // For now, pass userId from request body or header
    const userId = req.headers['x-user-id'] || req.body.userId;
    return this.subscriptionsService.upgradeSubscription(
      userId,
      subscriptionId,
      updateDto,
    );
  }

  @Put(':subscriptionId/downgrade')
  async downgradeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() updateDto: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    // When auth is enabled, use: req.user.sub
    // For now, pass userId from request body or header
    const userId = req.headers['x-user-id'] || req.body.userId;
    return this.subscriptionsService.downgradeSubscription(
      userId,
      subscriptionId,
      updateDto,
    );
  }

  @Delete(':subscriptionId/cancel')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Req() req: any,
  ) {
    // When auth is enabled, use: req.user.sub
    // For now, pass userId from request body or header
    const userId = req.headers['x-user-id'] || req.body.userId;
    return this.subscriptionsService.cancelSubscription(
      userId,
      subscriptionId,
    );
  }
}
