import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('AUTH0'))
  async login() {
    // Auth0 Guard will redirect to callback
  }

  @Get('callback')
  @UseGuards(AuthGuard('AUTH0'))
  @HttpCode(HttpStatus.OK)
  async callback(@Request() req: any) {
    // QA: Why return value? automatically return OK?
    // QA: are there multiple types i need to handle like stripe webhooks
    return this.auth.login(req.user);
  }

  // TODO: is there an events endpoint that I can subscribe to?

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('JWT'))
  async refresh(@Body() body: { refresh_token: string }) {
    // QA: can I get token from guard instead of body
    return this.auth.refresh(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('JWT'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: any) {
    // QA: Auth Guard handles session storing sessions in redis - so how does it remove them?

    const userId = req.user.userId;
    await this.auth.logout(userId);
  }
}
