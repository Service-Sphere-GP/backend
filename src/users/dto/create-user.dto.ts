import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Match } from './../../common/decorators/match.decorators';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'customer@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'pass1234' })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Password confirmation', example: 'pass1234' })
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @ApiProperty({ description: 'First name', example: 'Hussein' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Saad' })
  @IsString()
  @IsNotEmpty()
  last_name: string;
}
