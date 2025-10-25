import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ManagementClient } from 'auth0';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'JWT' }), RedisModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH0',
      useFactory: (config: ConfigService) => {
        return new ManagementClient({
          domain: config.get('AUTH0_DOMAIN', ''),
          clientId: config.get('AUTH0_CLIENT_ID', ''),
          clientSecret: config.get('AUTH0_CLIENT_SECRET', ''),
        });
      },
      inject: [ConfigService],
    },
    AuthService,
    Auth0Strategy,
    JwtStrategy,
  ],
  exports: ['AUTH0', AuthService],
})
export class AuthModule {}
