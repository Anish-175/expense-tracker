import { ConflictException, Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }
  


  

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
    const existingUser = await this.userService.findUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Registration failed. Please try again.');
    }
    return this.userService.createUser(createUserDto);
  }

  //handles login and token generation
  async login(user: User): Promise<{ access_token: string }> {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }


}
