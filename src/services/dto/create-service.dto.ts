import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  service_name: string;

  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsObject()
  service_attributes: Record<string, string>;

  @IsNumber()
  base_price: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];
}
