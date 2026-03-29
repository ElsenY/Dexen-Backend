import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { KafkaService } from '../kafka/kafka.service';
import { UserGateway } from './user.gateway';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [AttendanceModule],
  controllers: [UserController],
  providers: [UserService, KafkaService, UserGateway],
})

export class UserModule { }
