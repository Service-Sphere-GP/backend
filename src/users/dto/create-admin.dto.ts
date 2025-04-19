import { IsArray, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @IsArray()
  @IsOptional()
  permissions?: string[] = [];
}
