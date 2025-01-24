import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Service, ServiceSchema } from '../../services/schemas/service.schema';

@Schema()
export class ServiceProvider extends User {
  @Prop()
  business_name: string;

  @Prop({ type: [ServiceSchema], default: [] })
  services: Service[];
}

export const ServiceProviderSchema =
  SchemaFactory.createForClass(ServiceProvider);
