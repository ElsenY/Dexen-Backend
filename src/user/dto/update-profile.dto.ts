import { Expose } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Expose({ name: 'phone_number' })
  phoneNumber?: string;

  @ValidateIf((o: UpdateProfileDto) => o.newPassword !== undefined)
  @IsString()
  @MinLength(8)
  @Expose({ name: 'current_password' })
  currentPassword?: string;

  @ValidateIf((o: UpdateProfileDto) => o.currentPassword !== undefined)
  @IsString()
  @MinLength(8)
  @Expose({ name: 'new_password' })
  newPassword?: string;
}
