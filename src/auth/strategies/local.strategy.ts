// auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // use email instead of username
  }

  async validate(email: string, password: string): Promise<Partial<User>>{

    const user = await this.authService.validateUser(email, password);
    
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return {
      id: user.id,
      email: user.email,
      name: user.name
    }; //validated user with correct email and password
  }
}
