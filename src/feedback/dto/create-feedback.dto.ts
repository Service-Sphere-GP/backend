import { IsInt, IsNotEmpty, IsOptional, IsMongoId, Min, Max, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsMongoId()
  given_to_service?: string;
}