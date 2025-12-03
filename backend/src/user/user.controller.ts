import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password } = body;
    return this.userService.register(email, password);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    return this.userService.login(email, password);
  }
}
