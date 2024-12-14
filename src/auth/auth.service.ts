import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor() {}

  async login(info: any): Promise<string> {
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const data = new URLSearchParams({
      grant_type: process.env.GRANT,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      username: info.username,
      password: info.password,
    });

    try {
      const response = await axios.post(url, data);
      return response.data.access_token;
    } catch (error) {
      return error;
    }
  }

  private adminData = {
    username: process.env.ADMIN,
    password: process.env.PASSWORD,
  };

  async register(): Promise<string> {
    const adminToken = await this.getAdminToken();
    const createUserEndpoint = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;

    const userData = {
      username: 'brahim',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      enabled: true,
      credentials: [
        {
          type: '12345678',
          value: 'newuser-password',
          temporary: false,
        },
      ],
    };

    try {
      const response = await axios.post(createUserEndpoint, userData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User created successfully:', response.status);
      return 'User registered successfully';
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new Error('Failed to register user');
    }
  }

  async getAdminToken() {
    try {
      const response = await axios.post(
        'http://localhost:8080/realms/master/protocol/openid-connect/token',
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

      console.log('Admin Token:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error fetching admin token:',
        error.response?.data || error.message,
      );
    }
  }
}
