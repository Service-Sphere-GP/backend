import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

// This DTO is identical to CreateUserDto; refer to CreateUserDto for Swagger property documentation.
export class CreateCustomerDto extends CreateUserDto {
  @ApiPropertyOptional({
    description: 'Profile image for the customer',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profile_image?: any;
}
