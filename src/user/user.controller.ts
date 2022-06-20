import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import * as lodash from 'lodash';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    console.log('signin controller:', user);
    return lodash.omit(user, ['password', 'updatedAt']);
  }
}