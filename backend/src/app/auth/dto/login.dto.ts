import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用戶名稱',
    example: 'testuser',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: '密碼',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
