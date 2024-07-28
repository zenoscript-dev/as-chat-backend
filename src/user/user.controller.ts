import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  create(@Body() userLoginDto: UserLoginDto) {
    return this.userService.login(userLoginDto);
  }
  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    console.log(body);
    const user = await this.userService.createUser(body);
    return user;
  }
}
