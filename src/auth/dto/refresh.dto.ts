import { IsJWT, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh JWT token', example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;
}
