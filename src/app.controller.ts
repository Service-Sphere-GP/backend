import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Sends a friendly hello to anyone who knocks on the root door.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
