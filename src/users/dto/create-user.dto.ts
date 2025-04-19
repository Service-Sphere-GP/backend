import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Match } from './../../common/decorators/match.decorators';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;
}
