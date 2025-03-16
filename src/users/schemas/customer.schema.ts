import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema() // Make sure no timestamp option is here
export class Customer extends User {
  @Prop({ default: 0 })
  loyalty_points: number;

  @Prop()
  last_active_time: Date;

  @Prop()
  is_active: boolean;

  @Prop({ type: String, required: false })
  profile_image?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
