import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @Inject('REDIS') private redisClient: Redis,
  ) {}

  async login(user: any) {
    // Store refresh token in Redis for session management
    await this.storeRefreshToken(user.userId, user.refreshToken);

    // Return Auth0's tokens directly
    return {
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
      id_token: user.idToken,
      token_type: 'Bearer',
      expires_in: user.expiresIn,
    };
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const timeToLive = 60 * 60 * 24 * 30; // 30 days in seconds

    // Store mapping of user to refresh token for session tracking
    await this.redisClient.setex(
      `refresh_token:${userId}`,
      timeToLive,
      JSON.stringify({ 
        refreshToken,
        storedAt: new Date().toISOString(),
      }),
    );
  }

  async refreshTokens(refreshToken: string) {
    // Call Auth0's token endpoint to refresh
    const auth0Domain = this.configService.get('AUTH0_DOMAIN');
    const clientId = this.configService.get('AUTH0_CLIENT_ID');
    const clientSecret = this.configService.get('AUTH0_CLIENT_SECRET');

    const response = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await response.json();

    return {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      token_type: 'Bearer',
      expires_in: tokens.expires_in,
      // Auth0 may or may not return a new refresh token
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
    };
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisClient.del(`refresh_token:${userId}`);
    
    // Note: Auth0 tokens can't be truly revoked unless you implement
    // token blacklisting or use Auth0's revocation endpoint
  }

  async revokeAuth0RefreshToken(refreshToken: string): Promise<void> {
    // Call Auth0's revocation endpoint
    const auth0Domain = this.configService.get('AUTH0_DOMAIN');
    const clientId = this.configService.get('AUTH0_CLIENT_ID');
    const clientSecret = this.configService.get('AUTH0_CLIENT_SECRET');

    await fetch(`https://${auth0Domain}/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        token: refreshToken,
      }),
    });
  }
}
