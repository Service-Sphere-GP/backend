import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Feedback extends Document {
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Service', default: null })
  about_service?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  about_customer?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServiceProvider', default: null })
  from_provider?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  from_customer?: Types.ObjectId;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
