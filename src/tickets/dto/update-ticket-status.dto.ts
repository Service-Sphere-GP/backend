import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved', 'closed'] })
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status: string;
}
