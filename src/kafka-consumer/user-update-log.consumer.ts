import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Prisma as PrismaLog } from '../../dist/generated/prisma_log/client';
import { PrismaLogService } from '../prisma/dexen_log/prisma-log.service';

/** Must match the Kafka topic producers publish to. */
export const USER_UPDATE_LOG_TOPIC = 'USER_UPDATE_LOG';

@Controller()
export class UserUpdateLogConsumerController {
  private readonly logger = new Logger(UserUpdateLogConsumerController.name);

  constructor(private readonly prismaLog: PrismaLogService) { }

  @EventPattern(USER_UPDATE_LOG_TOPIC)
  async handle(@Payload() payload: unknown): Promise<void> {
    try {
      const data = this.parsePayload(payload);
      await this.prismaLog.userUpdateLog.create({
        data: {
          userId: data.userId,
          beforeUpdate: data.beforeUpdate as PrismaLog.InputJsonValue,
          afterUpdate: data.afterUpdate as PrismaLog.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.error(
        'Failed to persist USER_UPDATE_LOG message',
        err instanceof Error ? err.stack : err,
      );
      throw err;
    }
  }

  private parsePayload(payload: unknown): {
    userId: string;
    beforeUpdate: unknown;
    afterUpdate: unknown;
  } {
    let raw: unknown = payload;

    if (Buffer.isBuffer(payload)) {
      raw = JSON.parse(payload.toString('utf8'));
    } else if (typeof payload === 'string') {
      raw = JSON.parse(payload);
    } else if (payload && typeof payload === 'object' && 'value' in payload) {
      const m = payload as { value?: Buffer | string };
      if (Buffer.isBuffer(m.value)) {
        raw = JSON.parse(m.value.toString('utf8'));
      } else if (typeof m.value === 'string') {
        raw = JSON.parse(m.value);
      }
    }

    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid USER_UPDATE_LOG payload');
    }

    const o = raw as Record<string, unknown>;
    if (typeof o.userId !== 'string' || !o.userId) {
      throw new Error('userId is required');
    }
    if (o.beforeUpdate === undefined || o.afterUpdate === undefined) {
      throw new Error('beforeUpdate and afterUpdate are required');
    }

    return {
      userId: o.userId,
      beforeUpdate: o.beforeUpdate,
      afterUpdate: o.afterUpdate,
    };
  }
}
