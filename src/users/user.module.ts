import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Admin, AdminSchema } from './schemas/admin.schema';
import {
  ServiceProvider,
  ServiceProviderSchema,
} from './schemas/service-provider.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          {
            name: Admin.name,
            schema: AdminSchema,
            value: 'admin',
          },
          {
            name: ServiceProvider.name,
            schema: ServiceProviderSchema,
            value: 'service_provider',
          },
          { name: Customer.name, schema: CustomerSchema, value: 'customer' },
        ],
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class UserModule {}
