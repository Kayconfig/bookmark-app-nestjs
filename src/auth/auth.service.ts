import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    const { email, password } = dto;
    // find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    // user not exist throw exception
    if (!user) {
      throw new ForbiddenException({ error: 'Invalid Credentials' });
    }
    //compare password
    const pwMatches = await argon.verify(user.password, password);
    // password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException({ error: 'Invalid Credentials' });
    }
    //send back user
    delete user.password;
    const token = await this.signToken(user.id, email);
    return { user, token };
  }

  async signUp(dto: AuthDto) {
    const { email, password } = dto;
    // hash the user password
    const hashedPass = await argon.hash(password);
    // save the user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPass,
        },
        select: {
          id: true,
          createdAt: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // for detecting violation in unique fields, i.e a duplicate is detected
          throw new ForbiddenException({
            error: (error.meta.target as Array<string>).map(
              (target) => `${target} already in use.`,
            ),
          });
        }
      }
    }
  }

  signToken(userId: number, email: string): Promise<string> {
    const data = { sub: userId, email };
    return this.jwt.signAsync(data, {
      expiresIn: '50m',
      secret: this.config.getOrThrow('JWT_SECRET'),
    });
  }
}
