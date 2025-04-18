import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Types } from 'mongoose';
import { Document } from 'mongoose';

export type ServiceProviderDocument = ServiceProvider & Document;

@Schema()
export class ServiceProvider extends User {
  @Prop()
  business_name: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending',
  })
  verification_status: string;

  @Prop()
  verification_date: Date;

  @Prop({
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  })
  rating_average: number;

  @Prop({ required: true })
  business_address: string;

  @Prop({ required: true })
  tax_id: string;

  @Prop({ type: String, required: false })
  profile_image?: string;
}

export const ServiceProviderSchema =
  SchemaFactory.createForClass(ServiceProvider);
