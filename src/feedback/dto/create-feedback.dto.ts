import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Rating score (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'Feedback message or comments',
    example:
      'The service was excellent! The technician was professional and completed the work quickly.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'ID of the service this feedback is about',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  about_service?: Types.ObjectId;

  @ApiProperty({
    description:
      'ID of the customer this feedback is about (for service providers)',
    example: '507f1f77bcf86cd799439017',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  about_customer?: Types.ObjectId;

  // For backward compatibility - will be deprecated
  @ApiProperty({
    description: 'Legacy field, use about_service instead',
    required: false,
    deprecated: true,
  })
  @IsMongoId()
  @IsOptional()
  given_to_service?: Types.ObjectId;
}
