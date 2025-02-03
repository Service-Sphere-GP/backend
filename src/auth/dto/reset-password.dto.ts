import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  new_password: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  confirm_password: string;
}
