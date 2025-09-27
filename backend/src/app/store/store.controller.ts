import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreResponseDto } from './dto/store-response.dto';

@ApiTags('stores')
@ApiBearerAuth('JWT-auth')
@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({
    summary: '取得所有商店資訊',
    description: '獲取所有藥局的詳細資訊，包括庫存和營業時間。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得所有商店資訊',
    type: [StoreResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  async getAllStores(): Promise<StoreResponseDto[]> {
    return await this.storeService.getAllStores();
  }

  @Get(':id')
  @ApiOperation({
    summary: '根據 ID 取得特定商店資訊',
    description: '根據商店 UUID 獲取特定藥局的詳細資訊。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得商店資訊',
    type: StoreResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的商店',
  })
  async getStoreById(@Param('id') id: string): Promise<StoreResponseDto> {
    const store = await this.storeService.getStoreById(id);

    if (!store) {
      throw new NotFoundException(`找不到 ID 為 ${id} 的商店`);
    }

    return store;
  }
}
