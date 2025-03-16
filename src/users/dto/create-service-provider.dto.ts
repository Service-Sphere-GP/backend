import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceProviderDto extends CreateUserDto {
  @ApiProperty({ description: 'Business name', example: 'Acme Corp.' })
  @IsNotEmpty()
  @IsString()
  business_name: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main St, City, Country',
  })
  @IsNotEmpty()
  business_address: string;

  @ApiProperty({ description: 'Tax identifier', example: 'TAX1234567' })
  @IsNotEmpty()
  tax_id: string;

  @ApiPropertyOptional({
    description: 'Profile image for the service provider',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profile_image?: any;
}
