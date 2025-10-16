import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) {}

  async validateUser(profile: any): Promise<any> {
    // Here you would typically check if user exists in your database
    // and create one if not
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      picture: profile.picture,
    };
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.configService.get('JWT_EXPIRATION', '15m'),
    };
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const timeToLive = 60 * 60 * 24 * 30; // 30 days in seconds

    // Store refresh token in Redis with expiration
    await this.redisClient.setex(
      token,
      timeToLive,
      JSON.stringify({ userId }), // TODO: need to be an object?
    );

    return token;
  }

  async refreshTokens(refreshToken: string) {
    // Check if refresh token exists in Redis
    const { userId } = await this.validateRefreshToken(refreshToken)
    
    // Revoke old refresh token
    await this.redisClient.del(refreshToken);

    // TODO: consistent payload
    const payload = { sub: userId };
    const newAccessToken = this.generateAccessToken(payload);
    const newRefreshToken = await this.generateRefreshToken(userId);

    return {
        token_type: 'Bearer',
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: this.configService.get('JWT_EXPIRATION', '15m'), // TODO: SYNC TTL
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token by removing it from Redis
    await this.redisClient.del(refreshToken);
    
    // TODO: blacklist the access token
  }

  async validateRefreshToken(refreshToken: string): Promise<any> {
    const result = await this.redisClient.get(refreshToken);
    
    if (!result) { // token not found or expired
        throw new UnauthorizedException('Invalid refresh token');
    }

    const { userId } = JSON.parse(result);
  }
}
