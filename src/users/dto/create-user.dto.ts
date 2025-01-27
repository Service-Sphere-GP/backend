import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;

  @IsString()
  full_name: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsIn(['active', 'suspended'])
  status?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  profile_image?: string;

  @IsIn(['admin', 'customer', 'service_provider'])
  role: string;
}
