import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() info: string) {
    return this.authService.login(info);
  }

  @Post('logout')
  logout(@Headers('authorization') token: string): Promise<string> {
    const refreshToken = token.split(' ')[1];
    if (!refreshToken) {
      throw new HttpException(
        'Invalid authorization header format',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.logout(refreshToken);
  }
}
