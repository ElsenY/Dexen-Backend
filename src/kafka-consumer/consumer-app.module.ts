import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaLogModule } from '../prisma/dexen_log/prisma-log.module';
import { ConsumerHealthController } from './consumer-health.controller';
import { UserUpdateLogConsumerController } from './user-update-log.consumer';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaLogModule],
  controllers: [ConsumerHealthController, UserUpdateLogConsumerController],
})
export class ConsumerAppModule {}
