import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  bookingId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;
}
