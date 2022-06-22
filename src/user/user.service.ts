import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async editUser(userId: number, editUserDto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...editUserDto,
      },
    });
    delete user.password;
    return user;
  }
}
