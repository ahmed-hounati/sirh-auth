import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { CreateUserDto } from './dto/CreateUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() info: string) {
    console.log(info);

    return this.authService.login(info);
  }

  @Post('admin')
  amin() {
    return this.authService.getAdminToken();
  }

  @Post('/create')
  @Roles({ roles: ['admin'], mode: RoleMatchingMode.ALL })
  register() {
    return this.authService.register();
  }
}
