import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateServiceProviderDto extends CreateUserDto {
  @IsNotEmpty({ message: 'Business name is required' })
  @IsString({ message: 'Business name must be a string' })
  business_name: string;

  @IsNotEmpty({ message: 'Bussiness address is required' })
  business_address: string;

  @IsNotEmpty({ message: 'Tax id is required' })
  tax_id: string;
}
