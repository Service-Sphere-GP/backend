import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlacklistedJwtAuthGuard } from '../auth/guards/blacklisted-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdviceService } from './advice.service';

@ApiTags('Advice')
@Controller('advice')
export class AdviceController {
  constructor(private readonly adviceService: AdviceService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get AI advice for the logged-in service provider',
    description:
      'Retrieves AI-generated advice based on feedback for the currently authenticated service provider',
  })
  @ApiResponse({
    status: 200,
    description: 'AI advice retrieved successfully',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a service provider',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiBearerAuth('access-token')
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
