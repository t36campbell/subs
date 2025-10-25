import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'JWT') {
  constructor(private config: ConfigService) {
    const auth0Domain = config.get('AUTH0_DOMAIN');
    const audience = config.get('AUTH0_AUDIENCE');

    const secret_provider = passportJwtSecret({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      jwksRequestsPerMinute: 3,
      rateLimit: true,
      cache: true,
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: secret_provider,
      issuer: `https://${auth0Domain}/`,
      ignoreExpiration: false,
      algorithms: ['RS256'],
      audience,
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    // QA: how to validate the token? 
    // QA: is this the return value of the guard?

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      permissions: payload.permissions || [],
      scope: payload.scope,
      // Store the full payload for access to custom claims
      auth0Payload: payload,
    };
  }
}
