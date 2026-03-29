import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsumerAppModule } from './kafka-consumer/consumer-app.module';

async function bootstrap() {
  const logger = new Logger('KafkaConsumer');
  const app = await NestFactory.create(ConsumerAppModule, { bufferLogs: true });

  const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID ?? 'dexen-consumer',
        brokers,
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID ?? 'dexen-user-log',
      },
      subscribe: {
        fromBeginning: false,
      },
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.CONSUMER_HTTP_PORT ?? 3001);
  await app.listen(port);

  logger.log(
    `Kafka consumer subscribed (brokers=${brokers.join(',')}), HTTP health on port ${port}`,
  );
}

void bootstrap();
