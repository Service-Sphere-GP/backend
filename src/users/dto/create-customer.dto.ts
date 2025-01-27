import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsObject, IsDate, IsBoolean } from 'class-validator';

export class CreateCustomerDto extends CreateUserDto {
  @IsObject()
  preferences: Record<string, any>;

  @IsNumber()
  loyalty_points: number;

  @IsDate()
  last_active_time: Date;

  @IsBoolean()
  is_active: boolean;
}
