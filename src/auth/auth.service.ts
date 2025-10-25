import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManagementClient } from 'auth0';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    @Inject('REDIS') private redis: Redis,
    @Inject('AUTH0') private auth0: ManagementClient,
  ) {}

  async login(user: any) {
    await this.storeRefreshToken(user.userId, user.refreshToken);
    // TODO: store uid with subscription data for quick RBAC checks

    // TODO: Type for Token
    // QA: do I even need to return anything here?
    return {
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
      id_token: user.idToken,
      expires_in: user.expiresIn,
    };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const ttl = 60 * 60 * 24 * 30; // 30 days in seconds
    const key = `refresh_token:${userId}`;
    const value = JSON.stringify({
      token,
    });

    // QA: is there a way to get when a KV was created?
    await this.redis.setex(key, ttl, value);
  }

  async refresh(t: string) {
    // QA: should I get from cache first? 
    const cache = await this.redis.getex(`refresh_token:${t}`);
    const token = this.auth0.refreshTokens.get(t)

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return token
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
    await this.auth0.sessions.revoke('')
  }
}
