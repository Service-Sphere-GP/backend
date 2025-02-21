import { IsOptional, IsIn, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterTicketsDto {
  @ApiProperty({
    required: false,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
  })
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status?: string;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsMongoId()
  assigned_to?: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsMongoId()
  booking_id?: string;
}
