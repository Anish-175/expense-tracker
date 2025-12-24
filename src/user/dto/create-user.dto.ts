import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

//validate email and password
export class CreateUserDto {
  @IsString()
  @MinLength(6)
  password: string;
  
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
   
  @IsOptional()
  @IsString()
  refresh_token?: string;
}
