import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  //get user profile
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.userService.findById(user.userId);
  }

  // get all users
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.userService.findAll(req.user); //get only the authenticated user
  }

  //update user by uuid
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  //soft delete by uuid
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    await this.userService.softDelete(user.userId);
    return { message: `User with ID ${user.userId} has been soft deleted.` };
  }
}
