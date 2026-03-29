import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { plainToInstance, Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

class DTO {
  @IsString()
  @MinLength(1)
  @Expose({ name: 'phone_number' })
  phoneNumber?: string;
}

const pipe = new ValidationPipe({ transform: true, whitelist: true });
pipe.transform({ phoneNumber: '123' }, { type: 'body', metatype: DTO }).then(res => {
  console.log('Result for phoneNumber:', res);
}).catch(err => {
  console.error('Error for phoneNumber:', err);
});
