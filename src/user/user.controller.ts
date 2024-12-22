import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'create' })
  @Roles({ roles: ['admin'], mode: RoleMatchingMode.ALL })
  async register(createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      const status = error.response?.status || HttpStatus.BAD_REQUEST;
      const message =
        error.response?.data?.errorMessage ||
        error.message ||
        'An error occurred';
      throw new HttpException(message, status);
    }
  }
}
