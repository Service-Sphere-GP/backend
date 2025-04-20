import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
  IsMongoId,
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];
}
