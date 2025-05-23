import { forwardRef, Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';
import { ServiceBookingsModule } from '../service-bookings/service-bookings.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    forwardRef(() => ServiceBookingsModule),
    FeedbackModule,
    CategoriesModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
