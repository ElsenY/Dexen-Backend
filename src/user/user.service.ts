import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../dist/generated/prisma/client.js';
import { Prisma as PrismaLog } from '../../dist/generated/prisma_log/client.js';
import { PrismaService } from '../prisma/dexen/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { KafkaService } from '../kafka/kafka.service';
import { USER_UPDATE_LOG_TOPIC } from '../kafka-consumer/user-update-log.consumer.js';
import { UserGateway } from './user.gateway';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly userGateway: UserGateway,
  ) { }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.toPublicUser(user);
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    return users.map(user => this.toPublicUser(user));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, image?: Express.Multer.File) {

    console.log(dto)

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const data: Prisma.UserUpdateInput = {};

    if (dto.phoneNumber !== undefined) {
      data.phone_number = dto.phoneNumber;
    }

    if (image !== undefined) {
      data.image = new Uint8Array(image.buffer);
    }

    if (dto.newPassword !== undefined || dto.currentPassword !== undefined) {
      if (!dto.newPassword || !dto.currentPassword) {
        throw new BadRequestException(
          'currentPassword and newPassword are required together to change password',
        );
      }
      const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!ok) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      data.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    }

    if (Object.keys(data).length === 0) {
      return this.toPublicUser(user);
    }

    const beforeSnapshot = this.toAuditSnapshot(user);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const afterSnapshot = this.toAuditSnapshot(updated);

    await this.kafka.send(USER_UPDATE_LOG_TOPIC, {
      userId,
      beforeUpdate: beforeSnapshot,
      afterUpdate: afterSnapshot,
    });

    this.userGateway.broadcastUserUpdate(userId, beforeSnapshot, afterSnapshot);

    return this.toPublicUser(updated);
  }

  private toAuditSnapshot(user: {
    id: string;
    email: string;
    phone_number: string;
    image: Uint8Array | null;
  }): PrismaLog.InputJsonValue {
    return {
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      has_image: user.image ? true : false,
    };
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    phone_number: string;
    image: Uint8Array | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      image: user.image ? Buffer.from(user.image).toString('base64') : null,
    };
  }
}
