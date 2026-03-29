import { Global, Module } from '@nestjs/common';
import { PrismaLogService } from './prisma-log.service';

@Global()
@Module({
  providers: [PrismaLogService],
  exports: [PrismaLogService],
})
export class PrismaLogModule {}
