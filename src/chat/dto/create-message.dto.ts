import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ description: 'The ID of the booking this message belongs to' })
  bookingId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({ description: 'The text content of the message' })
  content: string;
}
