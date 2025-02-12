import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceBookingsModule {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service_id: Types.ObjectId;

  @Prop({ required: true })
  booking_date: Date;

  @Prop({ required: true })
  total_amount: number;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Object })
  booking_details: Record<string, any>;
}

export const ServiceBookingsSchema = SchemaFactory.createForClass(
  ServiceBookingsModule,
);
