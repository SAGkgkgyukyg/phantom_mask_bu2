import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token 類型',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token 有效期（秒）',
    example: 86400,
  })
  expiresIn: number;

  @ApiProperty({
    description: '用戶資訊',
  })
  user: {
    id: string;
    username: string;
    role: string;
  };
}
