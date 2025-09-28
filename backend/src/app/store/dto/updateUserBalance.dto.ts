import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class UpdateUserBalanceDto {
  @ApiProperty({
    description: '使用者 UUID',
    example: '789e1234-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: '使用者 ID 必須為有效的 UUID' })
  user_id: string;

  @ApiProperty({
    description: '新的現金餘額',
    example: 10000.50,
    minimum: 0,
  })
  @IsNumber({}, { message: '現金餘額必須為數字' })
  @Min(0, { message: '現金餘額不能為負數' })
  new_balance: number;
}