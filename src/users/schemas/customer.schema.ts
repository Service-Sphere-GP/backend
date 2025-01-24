import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema()
export class Customer extends User {
  @Prop({ default: 0 })
  loyalty_points: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
