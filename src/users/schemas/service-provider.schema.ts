import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Service, ServiceSchema } from '../../services/schemas/service.schema';
import { Document } from 'mongoose';

export type ServiceProviderDocument = ServiceProvider & Document;


@Schema()
export class ServiceProvider extends User {
  @Prop()
  business_name: string;

  @Prop({ type: [ServiceSchema], default: [] })
  services: Service[];

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
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

  @Prop({ type: Object })
  business_documents: Record<string, any>;
}

export const ServiceProviderSchema =
  SchemaFactory.createForClass(ServiceProvider);
