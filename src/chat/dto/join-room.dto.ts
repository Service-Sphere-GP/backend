import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the booking to join the chat for' })
  bookingId: string;
}
