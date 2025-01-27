import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceDto {
  @ApiProperty({ example: 'Plumbing' })
  @IsString()
  service_name: string;

  @ApiProperty({ type: Object, example: { availability: '24/7' } })
  service_attributes: Record<string, string>;

  @ApiProperty({ example: 100 })
  @IsNumber()
  base_price: number;

  @ApiProperty({ example: 'active' })
  @IsString()
  status: string;

  @ApiProperty({ example: 'Plumbing services' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Home Services' })
  @IsOptional()
  @IsString()
  category?: string;


  @ApiProperty({ example: "ObjectId('6794d963db9ce9d9caa11260')" })
  service_provider_id: Types.ObjectId;
}