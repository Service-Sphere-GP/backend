import { Types } from 'mongoose';

export interface ServiceInterface {
  service_name: string;
  service_attributes: Record<string, string>;
  base_price: number;
  status: string;
  description?: string;
  categories?: Types.ObjectId[];
  creation_time: Date;
  images: string[];
  service_provider?: Types.ObjectId;
}
