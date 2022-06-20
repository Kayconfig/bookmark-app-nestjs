import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() body: AuthDto) {
    return this.authService.signUp(body);
  }
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signIn(@Body() body: AuthDto) {
    return this.authService.login(body);
  }
}
