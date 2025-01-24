import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    UserModule
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}