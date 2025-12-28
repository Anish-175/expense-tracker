import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtRefreshSecret = configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    super({
      jwtFromRequest: (req) => req.cookies?.refreshToken,
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
      passReqToCallback: true,
    });
  }
  async validate(
    req: Request,
    payload: any,
  ): Promise<{ userId: number; refreshToken: string }> {
    return {
      userId: payload.sub,
      refreshToken: req.cookies?.refreshToken,
    };
  }
}
