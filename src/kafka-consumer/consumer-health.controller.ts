import { Controller, Get } from '@nestjs/common';

@Controller()
export class ConsumerHealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'kafka-consumer' };
  }
}
