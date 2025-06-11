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

      if (!feedback || feedback.length === 0) {
        return 'Not enough feedback data to provide advice.';
      }

      const dominantLanguage = this.detectDominantLanguage(feedback);

      const feedbackText = this.formatFeedbackForAdvice(
        feedback,
        dominantLanguage,
      );

      if (!feedbackText.trim()) {
        return 'Not enough feedback data to provide advice.';
      }

      this.logger.log(
        `Formatted feedback for advice (${dominantLanguage}): ${feedbackText.substring(0, 100)}...`,
      );

      const response = await this.callHuggingFaceModel(
        feedbackText,
        dominantLanguage,
      );
      return response;
    } catch (error) {
      this.logger.error(`Error getting advice: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get AI advice');
    }
  }

  private detectDominantLanguage(feedback: any[]): 'en' | 'ar' {
    let arabicCount = 0;
    let totalMessages = 0;

    for (const f of feedback) {
      if (f.message && f.message.trim()) {
        totalMessages++;

        const arabicPattern =
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        if (arabicPattern.test(f.message)) {
          arabicCount++;
        }
      }
    }

    const arabicPercentage =
      totalMessages > 0 ? (arabicCount / totalMessages) * 100 : 0;
    const dominantLanguage = arabicPercentage > 50 ? 'ar' : 'en';

    this.logger.log(
      `Language detection: ${arabicCount}/${totalMessages} Arabic messages (${arabicPercentage.toFixed(1)}%) -> ${dominantLanguage}`,
    );

    return dominantLanguage;
  }

  private formatFeedbackForAdvice(
    feedback: any[],
    language: 'en' | 'ar',
  ): string {
    const ratingGroups = {
      positive: feedback.filter((f) => f.rating >= 4),
      neutral: feedback.filter((f) => f.rating === 3),
      negative: feedback.filter((f) => f.rating <= 2),
    };

    const totalFeedback = feedback.length;
    const avgRating =
      feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;

    let formattedText = '';

    if (language === 'ar') {
      formattedText = `# تحليل تقييمات الخدمة\n\n`;
      formattedText += `## الإحصائيات العامة\n`;
      formattedText += `- **عدد التقييمات الإجمالي:** ${totalFeedback}\n`;
      formattedText += `- **متوسط التقييم:** ${avgRating.toFixed(1)}/5 ⭐\n\n`;

      if (ratingGroups.positive.length > 0) {
        formattedText += `## التقييمات الإيجابية (${ratingGroups.positive.length})\n\n`;
        ratingGroups.positive.slice(0, 3).forEach((f, index) => {
          formattedText += `- ${f.rating}/5: ${f.message}\n\n`;
        });
      }

      if (ratingGroups.neutral.length > 0) {
        formattedText += `## التقييمات المحايدة (${ratingGroups.neutral.length})\n\n`;
        ratingGroups.neutral.slice(0, 2).forEach((f, index) => {
          formattedText += `- ${f.rating}/5: ${f.message}\n\n`;
        });
      }

      if (ratingGroups.negative.length > 0) {
        formattedText += `## التقييمات السلبية (${ratingGroups.negative.length})\n\n`;
        ratingGroups.negative.slice(0, 3).forEach((f, index) => {
          formattedText += `- ${f.rating}/5: ${f.message}\n\n`;
        });
      }

      formattedText += `---\n\n`;
      formattedText += `## طلب النصيحة\n`;
      formattedText += `يرجى تقديم نصائح محددة وقابلة للتطبيق لتحسين الخدمة بناءً على هذه التقييمات. قم بتنسيق الإجابة بتنسيق Markdown مع العناوين والقوائم والتأكيدات المناسبة.`;
    } else {
      formattedText = `# Service Feedback Analysis\n\n`;
      formattedText += `## Overview Statistics\n`;
      formattedText += `- **Total Reviews:** ${totalFeedback}\n`;
      formattedText += `- **Average Rating:** ${avgRating.toFixed(1)}/5 ⭐\n\n`;

      if (ratingGroups.positive.length > 0) {
        formattedText += `## Positive Reviews (${ratingGroups.positive.length})\n\n`;
        ratingGroups.positive.slice(0, 3).forEach((f, index) => {
          formattedText += `${f.rating}/5: ${f.message}\n\n`;
        });
      }

      if (ratingGroups.neutral.length > 0) {
        formattedText += `## Neutral Reviews (${ratingGroups.neutral.length})\n\n`;
        ratingGroups.neutral.slice(0, 2).forEach((f, index) => {
          formattedText += `${f.rating}/5: ${f.message}\n\n`;
        });
      }

      if (ratingGroups.negative.length > 0) {
        formattedText += `## Negative Reviews (${ratingGroups.negative.length})\n\n`;
        ratingGroups.negative.slice(0, 3).forEach((f, index) => {
          formattedText += `- ${f.rating}/5: ${f.message}\n\n`;
        });
      }

      formattedText += `---\n\n`;
      formattedText += `## Advice Request\n`;
      formattedText += `Please provide specific and actionable advice to improve the service based on these reviews. Format your response in Markdown with appropriate headings, lists, and emphasis.`;
    }

    return formattedText;
  }

  private async callHuggingFaceModel(
    text: string,
    language: 'en' | 'ar' = 'en',
  ): Promise<any> {
    try {
      this.logger.log(
        `Calling Hugging Face model with feedback text (${language})`,
      );
      const initResponse = await axios.post(
        'https://gehadnasser-advice-model.hf.space/gradio_api/call/predict',
        {
          data: [text, language],
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
