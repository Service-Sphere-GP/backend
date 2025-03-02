import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

import * as bcrypt from 'bcrypt';

@Schema({ discriminatorKey: 'role' })
export class User extends Document {
  @Prop({ required: true })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  confirm_password: string;

  @Prop()
  full_name: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ default: 'active', enum: ['active', 'suspended'] })
  status: string;

  @Prop()
  phone_number: string;

  @Prop({ default: false })
  email_verified: boolean;

  @Prop()
  email_verification_otp: string;

  @Prop()
  email_verification_expires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (this.isModified('password')) {
    if (this.password !== this.confirm_password) {
      throw new Error('Passwords do not match');
    }

    this.password = await bcrypt.hash(this.password, 10);
    this.confirm_password = undefined;
  }
  this.full_name = `${this.first_name} ${this.last_name}`;
  next();
});
