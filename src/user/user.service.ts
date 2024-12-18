import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const adminToken = await this.getAdminToken();
    const createUserEndpoint = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;

    if (!createUserDto.role) {
      createUserDto.role = 'employee';
    }

    const keycloakPayload = {
      username: createUserDto.username,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: 'password',
          value: createUserDto.password,
          temporary: false,
        },
      ],
    };

    try {
      const response = await axios.post(createUserEndpoint, keycloakPayload, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.createUser(createUserDto);

      console.log('User created successfully:', response.status);
      return 'User registered successfully';
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data?.errorMessage || 'Keycloak error occurred';

        if (status === 409) {
          throw new HttpException(
            'Username already exist!',
            HttpStatus.CONFLICT,
          );
        }

        throw new HttpException(errorMessage, status);
      }
      throw new HttpException(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAdminToken() {
    try {
      const response = await axios.post(
        `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: 'admin-cli',
          grant_type: 'password',
          username: 'root',
          password: 'root',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.log(
        'Error fetching admin token:',
        error.response?.data || error.message,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 8);

    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role as Role,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }
}
