import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto';
import { ConfigService } from '@nestjs/config';
import { response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //validate the user
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);

    if (!user || user.deleted_at) return null; // 🛡️ Check for missing user first

    const isMatch = await compare(password, user.password);
    if (!isMatch) return null;

    return user;
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

  //handles login and token generation
  // async login(user: User): Promise<{ access_token: string }> {
  //   const payload = {
  //     sub: user.id,
  //   };

  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokenPayload = {
        sub: user.id,
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

      await this.userService.update(user.id, {
        refresh_token: await hash(refreshToken, 10),
      });

      return { accessToken: accessToken, refreshToken: refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async validateRefreshToken(refreshToken: string, user: User): Promise<User> {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newUser = await this.userService.findByIdWithRefreshToken(user.id);
    if (!newUser || !newUser.refresh_token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const isMatch = await compare(refreshToken, newUser.refresh_token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
