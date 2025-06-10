import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { SentimentAnalysisService } from './sentiment-analysis.service';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { ServicesModule } from '../services/services.module';
import { ServiceBookingsModule } from '../service-bookings/service-bookings.module';
import {
  ServiceBookings,
  ServiceBookingsSchema,
} from '../service-bookings/schemas/service-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: ServiceBookings.name, schema: ServiceBookingsSchema },
    ]),
    forwardRef(() => ServicesModule),
    forwardRef(() => ServiceBookingsModule),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, SentimentAnalysisService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
