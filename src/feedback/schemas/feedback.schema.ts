import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Service', default: null })
  service: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServiceBookings', required: true })
  booking: Types.ObjectId;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

FeedbackSchema.index({ user: 1, booking: 1 }, { unique: true });
FeedbackSchema.index({ service: 1, createdAt: -1 });
FeedbackSchema.index({ user: 1, createdAt: -1 });