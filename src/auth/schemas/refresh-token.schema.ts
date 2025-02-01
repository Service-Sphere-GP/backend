import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expires_at: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);