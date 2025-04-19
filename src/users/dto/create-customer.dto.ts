import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class CreateCustomerDto extends CreateUserDto {
  @IsOptional()
  profile_image?: any;
}
