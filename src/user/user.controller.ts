import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}
  //get user profile
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return await this.userService.findById(user.userId);
  }

  //update user by uuid
  @Patch()
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(user.userId, updateUserDto);
  }

  //soft delete by uuid
  @Delete()
  async deleteUser(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    await this.userService.softDelete(user.userId);
    return { message: `User with ID ${user.userId} has been soft deleted.` };
  }
}
