import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateServiceDto {
  @ApiProperty({ example: 'Plumbing', required: false })
  @IsString()
  service_name?: string;

  @ApiProperty({ type: Object, example: { availability: '24/7' }, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsObject()
  service_attributes?: Record<string, string>;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  base_price?: number;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'Plumbing services', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Home Services', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Array of image files to be uploaded',
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];

  @ApiProperty({ example: '6794d963db9ce9d9caa11260', required: false })
  @IsOptional()
  @IsString()
  service_provider_id?: string;
}
