import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Service extends Document {
  @Prop({ required: true })
  service_name: string;

  @Prop({ type: Object, required: true })
  service_attributes: Record<string, string>;

  @Prop({ required: true })
  base_price: number;

  @Prop({ required: true })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: Date.now })
  creation_time: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  service_provider_id: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Feedback', default: [] })
  feedbacks: Types.ObjectId[];


  @Prop({ type: Number, default: 3 })
  rating_average: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
