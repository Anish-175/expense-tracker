import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CreateUserDto } from 'src/user/dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //validate user email and password
  async validateUser(email: string, password: string): Promise<number> {
    const user = await this.userService.findUserByEmail(email);

    if (!user || user.deletedAt)
      throw new UnauthorizedException('Invalid email or password'); // 🛡️ Check for missing user first

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    return user.id;
  }

  //register a user with email and password
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Registration failed. Please try again.');
    }
    return this.userService.createUser(createUserDto);
  }

  //login user and generate access and refresh token
  async login(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      return this.issueTokens(userId);
    } catch (error) {
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  //when (auth/refresh) is called the refresh token is rotated
  async rotateRefreshToken(userId: number, refreshToken: string) {
    const validatedUserId = await this.validateRefreshToken(
      refreshToken,
      userId,
    );
    return this.issueTokens(validatedUserId);
  }

  //compare refresh token with database and return validated user id
  async validateRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<number> {
    const user = await this.userService.findByIdWithRefreshToken(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const isMatch = await compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user.id;
  }

  //Logout: Remove refresh token from database
  async logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  // auth/auth.service.ts
  async validateGoogleUser(profile: any): Promise<number> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    let user = await this.userService.findUserByEmail(email);
    if (!user) {
      const randomPassword = randomBytes(32).toString('hex');
      const hashedPassword = await hash(randomPassword, 10);

      await this.userService.createUser({
        email,
        name,
        password: hashedPassword,
      });
    }

    const googleUser = await this.userService.findUserByEmail(email);
    if (!googleUser) {
      throw new UnauthorizedException('Google account not found');
    }

    return googleUser.id;
  }

  //helper method to generate access and refresh token and save refresh token to database
  async issueTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenPayload = {
      sub: userId,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    await this.userService.update(userId, {
      refreshToken: await hash(refreshToken, 10),
    });

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
