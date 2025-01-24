import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema()
export class Service {
 @Prop({ required: true })
  service_name: string;

  @Prop({ type: Map, of: String })
  service_attributes: Record<string, string>;

  @Prop({ required: true })
  base_price: number;

  @Prop({ required: true })
  status: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ default: Date.now })
  creation_time: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);