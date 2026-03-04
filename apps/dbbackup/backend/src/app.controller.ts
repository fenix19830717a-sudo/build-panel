import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHello(): { status: string; version: string } {
    return {
      status: 'ok',
      version: '1.0.0',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
