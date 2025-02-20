import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceBookings {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Object })
  booking_details: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true })
  ticket_id: Types.ObjectId;
}

export const ServiceBookingsSchema =
  SchemaFactory.createForClass(ServiceBookings);
