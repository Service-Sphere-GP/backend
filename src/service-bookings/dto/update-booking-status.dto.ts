import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled'])
  status: string;
}
