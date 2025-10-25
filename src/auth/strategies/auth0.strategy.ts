import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'AUTH0') {
  constructor(
    private config: ConfigService,
    private auth: AuthService,
  ) {
    super({
      scope: config.get('AUTH0_SCOPE'),
      domain: config.get('AUTH0_DOMAIN'),
      clientID: config.get('AUTH0_CLIENT_ID'),
      callbackURL: config.get('AUTH0_CALLBACK_URL'),
      clientSecret: config.get('AUTH0_CLIENT_SECRET'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    extraParams: any,
    profile: any,
  ): Promise<any> {
    // QA: how to validate the auth0 token? 
    // QA: is this the return value of the guard?
    // QA: does this handle refresh automatically? should it?
    
    return {
      userId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      picture: profile.picture,
      accessToken, // Auth0 access token
      refreshToken, // Auth0 refresh token
      idToken: extraParams.id_token,
      expiresIn: extraParams.expires_in,
    };
  }
}
