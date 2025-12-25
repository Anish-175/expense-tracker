import {
  Body,
  Controller,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/user/dto';
import { AuthService } from './auth.service';

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
    return this.authService.login(req.user.userId); // req.user is injected by LocalStrategy
  }

  //refresh route
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: any) {
    return this.authService.login(req.user.userId);
  }
}
