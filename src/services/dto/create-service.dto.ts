import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  isObject,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceDto {
  @ApiProperty({ example: 'Plumbing' })
  @IsString()
  service_name: string;

  @ApiProperty({ type: Object, example: { availability: '24/7' } })
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsObject()
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

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Array of image files to be uploaded',
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];

  @ApiProperty({ example: '6794d963db9ce9d9caa11260' })
  @IsString()
  service_provider_id: string;
}
