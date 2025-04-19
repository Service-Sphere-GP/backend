import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdviceService } from './advice.service';

@Controller('advice')
export class AdviceController {
  constructor(private readonly adviceService: AdviceService) {}

  @Get('me')
  @UseGuards(BlacklistedJwtAuthGuard, RolesGuard)
  @Roles('service_provider')
  async getAdvice(@CurrentUser() user: any) {
    try {
      return {
        advice: await this.adviceService.getAdviceForServiceProvider(
          user.user_id,
        ),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
