import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../dist/generated/prisma/client.js';
import { PrismaService } from '../prisma/dexen/prisma.service';
import { ListAttendanceQueryDto } from './dto/list-attendance-query.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string) {
    const date = this.utcDateOnly(new Date());
    const now = new Date();

    try {
      return this.serialize(
        await this.prisma.attendance.create({
          data: {
            userId,
            date,
            checkIn: now,
            checkOut: now,
          },
        }),
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Already checked in for this date');
      }
      throw e;
    }
  }

  async checkOut(userId: string) {
    const date = this.utcDateOnly(new Date());
    const row = await this.prisma.attendance.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });
    if (!row) {
      throw new NotFoundException('No check-in found for today');
    }

    const now = new Date();
    return this.serialize(
      await this.prisma.attendance.update({
        where: { id: row.id },
        data: { checkOut: now },
      }),
    );
  }

  async listForUser(userId: string, query: ListAttendanceQueryDto) {
    const { from_date, to_date } = query;

    if (from_date && to_date) {
      const from = this.parseDateOnly(from_date);
      const to = this.parseDateOnly(to_date);
      if (from.getTime() > to.getTime()) {
        throw new BadRequestException('from_date must be on or before to_date');
      }
    }

    const where: Prisma.AttendanceWhereInput = { userId };

    if (from_date && to_date) {
      where.date = {
        gte: this.parseDateOnly(from_date),
        lte: this.parseDateOnly(to_date),
      };
    } else if (from_date) {
      where.date = { gte: this.parseDateOnly(from_date) };
    } else if (to_date) {
      where.date = { lte: this.parseDateOnly(to_date) };
    }

    const rows = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return rows.map((r) => this.serialize(r));
  }

  private utcDateOnly(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }

  private parseDateOnly(isoDate: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      throw new BadRequestException(
        'Dates must be ISO format YYYY-MM-DD (use from_date / to_date query params)',
      );
    }
    const [y, m, day] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, day));
  }

  private serialize(row: {
    id: string;
    userId: string;
    date: Date;
    checkIn: Date;
    checkOut: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      user_id: row.userId,
      date: row.date.toISOString().slice(0, 10),
      check_in: row.checkIn.toISOString(),
      check_out: row.checkOut.toISOString(),
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
  }
}
