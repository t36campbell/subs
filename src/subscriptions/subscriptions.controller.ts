import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  Get,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

import { AuthGuard } from '@nestjs/passport';
import { Subscription } from './subscriptions.models';

@Controller('subscriptions')
// @UseGuards(AuthGuard('JWT')) // Uncomment when Auth0 JWT strategy is configured
export class SubscriptionsController {
  constructor(private readonly subscription: SubscriptionsService) {}
  // TODO: get token from Guard

  @Post(':sid')
  async upsert(
    @Param('sid') sid: string,
    @Body() body: Subscription,
    @Req() req: any,
  ) {
    const uid = req.headers['x-user-id'] || req.body.uid;
    return this.subscription.upsert(uid, sid, body);
  }

  @Get(':sid')
  async retrieve(@Param('sid') sid: string, @Req() req: any) {
    const uid = req.headers['x-user-id'] || req.body.uid;
    return this.subscription.retrieve(uid, sid);
  }

  @Put(':sid')
  async resume(@Param('sid') sid: string, @Req() req: any) {
    const uid = req.headers['x-user-id'] || req.body.uid;
    return this.subscription.resume(uid, sid);
  }

  @Delete(':sid')
  async cancel(@Param('sid') sid: string, @Req() req: any) {
    const uid = req.headers['x-user-id'] || req.body.uid;
    return this.subscription.cancel(uid, sid);
  }
}
