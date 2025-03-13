import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({
    type: Types.ObjectId,
    ref: 'ServiceBookings',
    required: true,
  })
  booking_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: string;

  @Prop({
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  })
  status: string;

  @Prop()
  resolution_details?: string;

  @Prop()
  resolution_time?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  })
  assigned_to: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
