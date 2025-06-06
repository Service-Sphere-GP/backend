import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

import * as bcrypt from 'bcrypt';

@Schema({ discriminatorKey: 'role', timestamps: true })
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

  @Prop({ default: 0 })
  otp_attempts: number;

  @Prop({ default: true })
  emailSent: boolean;

  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (this.isModified('password')) {
    if (
      this.confirm_password !== undefined &&
      this.password !== this.confirm_password
    ) {
      throw new Error('Passwords do not match');
    }

    if (!this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    this.confirm_password = undefined;
  }

  if (this.first_name && this.last_name) {
    this.full_name = `${this.first_name} ${this.last_name}`;
  }

  next();
});
