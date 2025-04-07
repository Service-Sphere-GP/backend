import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { FeedbackService } from './../feedback/feedback.service';
import { ServicesService } from 'src/services/services.service';

@Injectable()
export class AdviceService {
  private readonly logger = new Logger('AdviceService');

  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly servicesService: ServicesService,
  ) {}

  async getAdviceForServiceProvider(providerId: string): Promise<string> {
    try {
      const services =
        await this.servicesService.getAllServicesByProviderId(providerId);

      console.log(services);

      const feedback = [];

      for (const service of services) {
        const serviceFeedback =
          await this.feedbackService.getAllFeedbackByServiceId(
            (service as any)._id.toString(),
          );

          console.log((service as any)._id.toString());;
        feedback.push(...serviceFeedback);
      }


      const feedbackText = feedback
        .map((f) => `Rating: ${f.rating}, Message: ${f.message}`)
        .join('\n');

      if (!feedbackText.trim()) {
        return 'Not enough feedback data to provide advice.';
      }

      const response = await this.callHuggingFaceModel(feedbackText);
      return response;
    } catch (error) {
      this.logger.error(`Error getting advice: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get AI advice');
    }
  }

  private async callHuggingFaceModel(text: string): Promise<any> {
    return "TEST";
  }
}
