import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { FeedbackService } from './../feedback/feedback.service';
import { ServicesService } from 'src/services/services.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AdviceService {
  private readonly logger = new Logger('AdviceService');

  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly servicesService: ServicesService,
    private readonly configService: ConfigService,
  ) {}

  async getAdviceForServiceProvider(providerId: string): Promise<string> {
    try {
      const services =
        await this.servicesService.getAllServicesByProviderId(providerId);

      const feedback = [];

      for (const service of services) {
        const serviceFeedback =
          await this.feedbackService.getAllFeedbackByServiceId(
            (service as any)._id.toString(),
          );

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
    try {
      this.logger.log('Calling Hugging Face model with feedback text');
      const initResponse = await axios.post(
        'https://gehadnasser-advice-model.hf.space/gradio_api/call/predict',
        {
          data: [text, 'en'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const eventId = initResponse.data.event_id;
      if (!eventId) {
        throw new Error('Failed to get event_id from Hugging Face API');
      }

      this.logger.log(`Received event_id: ${eventId}`);

      const resultResponse = await axios.get(
        `https://gehadnasser-advice-model.hf.space/gradio_api/call/predict/${eventId}`,
        {
          headers: {
            Accept: 'text/event-stream',
          },
        },
      );

      const responseData = resultResponse.data;

      if (typeof responseData === 'string' && responseData.includes('data:')) {
        const jsonMatch = responseData.match(/data: (\[.*\])/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedData = JSON.parse(jsonMatch[1]);
          return parsedData[0];
        }
      }

      if (
        responseData &&
        Array.isArray(responseData) &&
        responseData.length > 0
      ) {
        return responseData[0];
      }

      return 'Failed to parse advice from model response';
    } catch (error) {
      this.logger.error(
        `Error calling Hugging Face model: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to get prediction from AI model',
      );
    }
  }
}
