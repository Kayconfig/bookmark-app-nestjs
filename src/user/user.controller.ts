import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import * as lodash from 'lodash';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    console.log('signin controller:', user);
    return lodash.omit(user, ['password', 'updatedAt']);
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
