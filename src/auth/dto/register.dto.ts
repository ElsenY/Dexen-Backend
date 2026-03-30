import { IsEmail, Matches, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @Matches(/^\+?\d{8,15}$/)
  phone_number: number;
}
