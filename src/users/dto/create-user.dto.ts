import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Match } from './../../common/decorators/match.decorators';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;
}
