import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';

class CredentialsDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsBoolean()
  temporary: boolean;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a correct email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  credentials: CredentialsDto[];

  role: string;
}
