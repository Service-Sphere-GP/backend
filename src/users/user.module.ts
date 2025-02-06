import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Admin, AdminSchema } from './schemas/admin.schema';
import {
  ServiceProvider,
  ServiceProviderSchema,
} from './schemas/service-provider.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { UsersService } from './users.service';
import {UsersController} from './users.controller'

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
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule, UsersService],
})
export class UserModule {}
