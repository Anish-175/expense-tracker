import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    const jwtRefreshSecret = configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
    });
  }
  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // IMPORTANT: only return user
    return user;
  }
}
