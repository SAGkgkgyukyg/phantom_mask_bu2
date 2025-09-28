import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, Matches } from 'class-validator';
import { WeekdayName } from '../enum/weekday.enum';

export class StoreFilterDto {
  @ApiProperty({
    description: '營業開始時間（格式：HH:mm，例如：09:00）。注意：start_time 和 end_time 必須同時提供',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '開始時間格式錯誤，請使用 HH:mm 格式（例如：09:00）',
  })
  start_time?: string;

  @ApiProperty({
    description: '營業結束時間（格式：HH:mm，例如：18:00）。注意：start_time 和 end_time 必須同時提供',
    example: '18:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '結束時間格式錯誤，請使用 HH:mm 格式（例如：18:00）',
  })
  end_time?: string;

  @ApiProperty({
    description: '星期篩選（可以是星期名稱或縮寫，例如：["monday", "tue"]）',
    example: ['monday', 'tuesday'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weekdays?: string[];
}
