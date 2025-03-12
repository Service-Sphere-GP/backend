import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    description: 'Admin permissions',
    example: ['manage_users', 'manage_services'],
    required: false,
    default: [],
  })
  @IsArray()
  @IsOptional()
  permissions?: string[] = [];
}
