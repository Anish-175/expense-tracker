import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //validate the user
  async validateUser(email: string, password: string): Promise<number> {
    const user = await this.userService.findUserByEmail(email);

    if (!user || user.deleted_at)
      throw new UnauthorizedException('Invalid email or password'); // 🛡️ Check for missing user first

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    return user.id;
  }

  //register a user
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Registration failed. Please try again.');
    }
    return this.userService.createUser(createUserDto);
  }

  async login(
    userId: number,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const tokenPayload = {
        sub: userId,
      };

      const accessToken = this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
      });

      const refreshToken = this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ),
      });

      await this.userService.update(userId, {
        refresh_token: await hash(refreshToken, 10),
      });

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async validateRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<number> {
    const user = await this.userService.findByIdWithRefreshToken(userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const isMatch = await compare(refreshToken, user.refresh_token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user.id;
  }
}
