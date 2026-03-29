import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from './current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { Public } from 'src/auth/public.decorator';
import { AttendanceService } from '../attendance/attendance.service';
import { ListAttendanceQueryDto } from '../attendance/dto/list-attendance-query.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly user: UserService,
    private readonly attendance: AttendanceService,
  ) { }

  @Get('me')
  getMe(@CurrentUser() auth: JwtPayload) {
    return this.user.getUser(auth.sub);
  }

  @Get()
  @Public()
  getAllUsers() {
    return this.user.getAllUsers();
  }

  @Get('attendances')
  getAttendances(
    @CurrentUser() auth: JwtPayload,
    @Query() query: ListAttendanceQueryDto,
  ) {
    return this.attendance.listForUser(auth.sub, query);
  }

  @Post('check-in')
  checkIn(@CurrentUser() auth: JwtPayload) {
    return this.attendance.checkIn(auth.sub);
  }

  @Post('check-out')
  checkOut(@CurrentUser() auth: JwtPayload) {
    return this.attendance.checkOut(auth.sub);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  updateMe(
    @CurrentUser() auth: JwtPayload,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.user.updateProfile(auth.sub, dto, image);
  }

  @Patch(':id/profile')
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.user.updateProfile(id, dto, image);
  }
}
