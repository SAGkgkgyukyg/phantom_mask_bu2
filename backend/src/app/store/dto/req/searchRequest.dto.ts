import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

export enum SearchType {
  PHARMACY = 'pharmacy',
  MASK = 'mask',
  ALL = 'all',
}

export class SearchRequestDto {
  @ApiProperty({
    description: '搜尋關鍵字',
    example: '健康',
    minLength: 1,
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: '搜尋類型',
    enum: SearchType,
    example: SearchType.ALL,
    required: false,
  })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @ApiProperty({
    description: '每頁結果數量',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: '頁面偏移量',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}