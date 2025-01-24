import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema()
export class ServiceProvider extends User {
  @Prop()
  business_name: string;
}

export const ServiceProviderSchema =
  SchemaFactory.createForClass(ServiceProvider);
