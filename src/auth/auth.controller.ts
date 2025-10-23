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
  constructor(private authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('auth0'))
  async login() {
    // Auth0 will redirect to callback
  }

  @Get('callback')
  @UseGuards(AuthGuard('auth0'))
  @HttpCode(HttpStatus.OK)
  async callback(@Request() req: any) {
    // Return Auth0's tokens to the client
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: any) {
    const userId = req.user.userId;
    await this.authService.logout(userId);
  }
}
