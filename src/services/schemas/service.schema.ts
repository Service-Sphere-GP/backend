import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

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

  @Prop({ type: [Types.ObjectId], ref: Category.name, default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: Date.now })
  creation_time: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  service_provider: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  rating_average: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
