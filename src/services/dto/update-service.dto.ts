import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  service_name?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsObject()
  service_attributes?: Record<string, string>;

  @IsOptional()
  @IsNumber()
  base_price?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
  
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];

  @IsOptional()
  @IsString()
  service_provider_id?: string;
}
