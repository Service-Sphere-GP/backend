import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsIn,
  IsDate,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class CreateServiceProviderDto extends CreateUserDto {
  @IsString()
  business_name: string;


  @IsIn(['pending', 'verified', 'suspended', 'rejected'])
  verification_status: string;

  @IsDate()
  verification_date: Date;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating_average: number;

  @IsObject()
  business_documents: Record<string, any>;

  //TODO add servcies array validation after creating service dto 


}
