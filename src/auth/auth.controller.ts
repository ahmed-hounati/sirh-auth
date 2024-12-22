import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  login(info: string) {
    return this.authService.login(info);
  }

  @MessagePattern({ cmd: 'logout' })
  logout(token: string): Promise<string> {
    const refreshToken = token.split(' ')[1];
    if (!refreshToken) {
      throw new HttpException(
        'Invalid authorization header format',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.logout(refreshToken);
  }

  @MessagePattern({ cmd: 'getUserId' })
  getUserId(token: string): Promise<string> {
    const refreshToken = token.split(' ')[1];
    return this.authService.getUserId(refreshToken);
  }
}
