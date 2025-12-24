import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto';

@Controller('auth')
export class AuthController {
  userService: any;
  constructor(private readonly authService: AuthService) {}

  /**
   * Login with email and password using LocalStrategy
   * Returns a signed JWT if credentials are valid
   */

  //register route or create new user
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
    return 'user created successfully';
  }

  //login route
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user); // req.user is injected by LocalStrategy
  }
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = authHeader.replace('Bearer ', '').trim();

    // req.user is now guaranteed to be a valid user
    await this.authService.validateRefreshToken(refreshToken, req.user);

    return this.authService.login(req.user);
  }
}
