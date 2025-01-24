import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('The Ultimate Greeter')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Sends a friendly hello to anyone who knocks on the root door.
   */
  @Get()
  @ApiOperation({ summary: 'Wave hello to the world' })
  @ApiResponse({ 
    status: 200, 
    description: 'A warm and fuzzy hello returned with a smiley face 😊', 
    type: String 
  })
  getHello(): string {
    return this.appService.getHello();
  }
}