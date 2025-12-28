import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';

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
  async login(@Req() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user.userId,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production (HTTPS)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // req.user is injected by LocalStrategy
    return { accessToken };
  }

  //refresh route
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const { userId, oldRefreshToken } = req.user;
    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(userId, oldRefreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production (HTTPS)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }
}
