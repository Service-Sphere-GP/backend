import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsMongoId()
  @IsNotEmpty()
  service: Types.ObjectId;


  @IsMongoId()
  @IsNotEmpty()
  booking: Types.ObjectId;
}
