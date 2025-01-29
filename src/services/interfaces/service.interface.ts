import { Types } from 'mongoose';

export interface ServiceInterface {
  service_name: string;
  service_attributes: Record<string, string>;
  base_price: number;
  status: string;
  description?: string;
  category?: string;
  creation_time: Date;
  images: string[]; // URLs of images after uploading to Cloudinary
  service_provider_id?: Types.ObjectId;
}