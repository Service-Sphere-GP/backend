import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';

@Module({
  imports: [
    UserModule, 
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema }
    ])
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}