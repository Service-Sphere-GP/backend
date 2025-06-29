import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

@Injectable()
export class SentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);
  private readonly baseUrl =
    'https://habibaahmed1-arabic-english-feedback-analysis.hf.space';

  async analyzeSentiment(
    text: string,
    language?: string,
  ): Promise<SentimentAnalysisResult> {
    const detectedLanguage = language || this.detectLanguage(text);

    this.logger.log(
      `Calling sentiment model with text: ${text.substring(0, 50)}... (Language: ${detectedLanguage})`,
    );
    try {
      const initResponse = await axios.post(
        `${this.baseUrl}/gradio_api/call/classify_sentiment`,
        {
          data: [text, detectedLanguage],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const eventId = initResponse.data.event_id;
      if (!eventId) {
        throw new Error('No event_id returned from sentiment model');
      }

      this.logger.log(`Received eventId: ${eventId}`);

      const resultResponse = await axios.get(
        `${this.baseUrl}/gradio_api/call/classify_sentiment/${eventId}`,
        {
          headers: {
            Accept: 'text/event-stream',
          },
          timeout: 15000,
        },
      );

      const responseData = resultResponse.data;

      if (typeof responseData === 'string' && responseData.includes('data:')) {
        const jsonMatch = responseData.match(/data: (\[.*\])/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedData = JSON.parse(jsonMatch[1]);
          return this.parseModelResponse(parsedData);
        }
      }

      if (
        responseData &&
        Array.isArray(responseData) &&
        responseData.length > 0
      ) {
        return this.parseModelResponse(responseData);
      }

      this.logger.warn(
        'Failed to parse sentiment response, defaulting to neutral',
      );
    } catch (error) {
      this.logger.error(`Sentiment analysis error: ${error.message}`);
    }
    return { sentiment: 'neutral', score: 0.5 };
  }

  private detectLanguage(text: string): 'Arabic' | 'English' {
    const arabicPattern =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    const arabicMatches = text.match(new RegExp(arabicPattern, 'g'));
    const arabicCharCount = arabicMatches ? arabicMatches.length : 0;

    const totalChars = text.replace(/\s+/g, '').length; 
    const arabicPercentage =
      totalChars > 0 ? (arabicCharCount / totalChars) * 100 : 0;

    const detectedLanguage = arabicPercentage > 30 ? 'Arabic' : 'English';

    this.logger.log(
      `Language detection: ${arabicCharCount}/${totalChars} Arabic chars (${arabicPercentage.toFixed(1)}%) -> ${detectedLanguage}`,
    );

    return detectedLanguage;
  }

  private parseModelResponse(data: any[]): SentimentAnalysisResult {
    if (data.length > 0 && typeof data[0] === 'string') {
      const responseText = data[0].trim();

      this.logger.log(`Raw response from model: ${responseText}`);


      let sentimentMatch = responseText.match(
        /Sentiment:\s*(positive|negative|neutral)/i,
      );
      let scoreMatch = responseText.match(/Confidence:\s*(\d+\.?\d*)/i);

      if (!sentimentMatch) {
        sentimentMatch = responseText.match(/^(positive|negative|neutral)/i);
      }

      if (!scoreMatch) {
        scoreMatch = responseText.match(/\((\d+\.?\d*)\)/);
      }

      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let score = 0.5;

      if (sentimentMatch) {
        sentiment = this.mapSentimentLabel(sentimentMatch[1]);
        this.logger.log(`Found sentiment match: ${sentimentMatch[1]}`);
      } else {
        this.logger.warn(`No sentiment match found in: ${responseText}`);
      }

      if (scoreMatch && scoreMatch[1]) {
        score = parseFloat(scoreMatch[1]);
        this.logger.log(`Found score match: ${scoreMatch[1]}`);
      } else {
        this.logger.warn(`No score match found in: ${responseText}`);
      }

      this.logger.log(`Parsed sentiment: ${sentiment}, score: ${score}`);
      return { sentiment, score };
    }

    this.logger.warn(`Invalid data format: ${JSON.stringify(data)}`);
    return { sentiment: 'neutral', score: 0.5 };
  }

  private mapSentimentLabel(
    label: string,
  ): 'positive' | 'negative' | 'neutral' {
    const normalizedLabel = label.toLowerCase().trim();
    switch (normalizedLabel) {
      case 'positive':
        return 'positive';
      case 'negative':
        return 'negative';
      default:
        return 'neutral';
    }
  }
}
