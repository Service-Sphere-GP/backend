import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceProviderDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  business_name: string;

  @IsNotEmpty()
  business_address: string;

  @IsNotEmpty()
  tax_id: string;

  @IsOptional()
  profile_image?: any;
}
