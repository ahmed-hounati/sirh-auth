import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      return response.data;
    } catch (error) {
      return error;
    }
  }

  async logout(token: string): Promise<string> {
    try {
      const logoutEndpoint = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;

      const data = new URLSearchParams({
        grant_type: process.env.GRANT,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        refresh_token: token,
      });

      const response = await axios.post(logoutEndpoint, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.status === 204) {
        return 'User logged out successfully';
      }

      throw new HttpException(
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data?.error_description || 'Logout failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
