import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

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

  async getUserId(token: string): Promise<string> {
    try {
      // Fetch the Keycloak public keys
      const jwksUri = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
      const { data } = await axios.get(jwksUri);

      console.log(token);
      

      // Decode the token header to find the key ID
      const decodedHeader: any = jwt.decode(token);
      const key = data.keys.find(
        (k: any) => k.kid === decodedHeader.header.kid,
      );

      if (!key) {
        throw new HttpException(
          'Public key not found for the token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Convert the key to PEM format
      const publicKey = this.convertToPem(key.n, key.e);

      // Verify the token using the public key
      const decodedToken: any = jwt.verify(token, publicKey, {
        algorithms: ['HS256'],
        issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      });

      // Return the userId (sub claim)
      return decodedToken.sub;
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private convertToPem(modulus: string, exponent: string): string {
    const base64modulus = Buffer.from(modulus, 'base64');
    const base64exponent = Buffer.from(exponent, 'base64');

    const rsaKey = {
      kty: 'RSA',
      n: base64modulus,
      e: base64exponent,
    };

    return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(
      JSON.stringify(rsaKey),
    ).toString('base64')}\n-----END PUBLIC KEY-----`;
  }
}
