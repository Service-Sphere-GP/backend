import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema()
export class Admin extends User {
  @Prop()
  permissions: string[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
