import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['booking', 'status_change', 'feedback', 'system'],
    default: 'system',
  })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'ServiceBookings', index: true })
  booking_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', index: true })
  service_id?: Types.ObjectId;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
