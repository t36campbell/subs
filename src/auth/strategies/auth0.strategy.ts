import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      scope: configService.get('AUTH0_SCOPE'),
      domain: configService.get('AUTH0_DOMAIN'),
      clientID: configService.get('AUTH0_CLIENT_ID'),
      callbackURL: configService.get('AUTH0_CALLBACK_URL'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    extraParams: any,
    profile: any,
  ): Promise<any> {
    // Return user data with Auth0 tokens
    return {
      userId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      picture: profile.picture,
      accessToken,        // Auth0 access token
      refreshToken,       // Auth0 refresh token  
      idToken: extraParams.id_token,
      expiresIn: extraParams.expires_in,
    };
  }
}
