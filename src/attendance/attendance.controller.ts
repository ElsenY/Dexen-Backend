import { Controller, Get, Post, Query } from '@nestjs/common';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../user/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { ListAttendanceQueryDto } from './dto/list-attendance-query.dto';

@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post('check-in')
  checkIn(@CurrentUser() auth: JwtPayload) {
    return this.attendance.checkIn(auth.sub);
  }

  @Post('check-out')
  checkOut(@CurrentUser() auth: JwtPayload) {
    return this.attendance.checkOut(auth.sub);
  }

  @Get()
  list(
    @CurrentUser() auth: JwtPayload,
    @Query() query: ListAttendanceQueryDto,
  ) {
    return this.attendance.listForUser(auth.sub, query);
  }
}
