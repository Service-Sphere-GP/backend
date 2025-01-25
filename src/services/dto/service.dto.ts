import { ApiProperty } from '@nestjs/swagger';

export class ServiceDto {
  @ApiProperty({ example: 'Plumbing' })
  service_name: string;

  @ApiProperty({ type: Object, example: { availability: '24/7' } })
  service_attributes: Record<string, string>;

  @ApiProperty({ example: 100 })
  base_price: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'Plumbing services' })
  description?: string;

  @ApiProperty({ example: 'Home Services' })
  category?: string;

  @ApiProperty({ example: '2021-09-01T00:00:00.000Z' })
  creation_time: Date;

  @ApiProperty({
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Array of image URLs associated with the service',
  })
  images: string[];

  @ApiProperty({ example: '1234567890' })
  service_provider_id?: string;
}