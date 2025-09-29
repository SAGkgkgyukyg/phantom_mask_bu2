import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { Roles } from '../auth/roles.decorator';
// Request DTOs (用於方法參數)
import {
  StoreFilterDto,
  InventoryFilterDto,
  PriceQuantityFilterDto,
  TopSpendersFilterDto,
  BulkPurchaseDto,
  CancelTransactionDto,
  UpdateUserBalanceDto,
  UpdateInventoryDto,
  BulkUpsertMaskProductsDto,
  SearchRequestDto,
} from './dto/req';

// Response DTOs (用於 Swagger 和返回類型)
import {
  StoreResponseDto,
  PharmacyInventoryResponseDto,
  PriceQuantityFilterResponseDto,
  TopSpendersResponseDto,
  BulkPurchaseResponseDto,
  CancelTransactionResponseDto,
  UpdateUserBalanceResponseDto,
  UpdateInventoryResponseDto,
  BulkUpsertMaskProductsResponseDto,
  SearchResponseDto,
} from './dto/res';

@ApiTags('Stores')
@ApiBearerAuth('JWT-auth')
@Controller('stores')
@UseGuards(JwtAuthGuard, CsrfGuard) // 所有 endpoint 的基本保護
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiTags('Stores / Information')
  @Post('search')
  @ApiOperation({
    summary: '搜尋商店資訊',
    description:
      '根據營業時間區間和星期篩選條件，獲取符合條件的藥局基本資訊。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得符合條件的商店資訊',
    type: [StoreResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤',
  })
  async getAllStores(
    @Body() filterDto?: StoreFilterDto,
  ): Promise<StoreResponseDto[]> {
    return await this.storeService.getAllStores(filterDto);
  }

  @ApiTags('Stores / Information')
  @Post('inventory')
  @ApiOperation({
    summary: '取得指定藥局的存貨資訊',
    description:
      '根據藥局 ID 獲取該藥局販售的所有口罩存貨資訊，支援依名稱或價格排序。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得藥局存貨資訊',
    type: PharmacyInventoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或藥局 ID 格式無效',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的藥局',
  })
  async getPharmacyInventory(
    @Body() filterDto: InventoryFilterDto,
  ): Promise<PharmacyInventoryResponseDto> {
    return await this.storeService.getPharmacyInventory(filterDto);
  }

  @ApiTags('Stores / Information')
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

  @ApiTags('Stores / Information')
  @Post('filter-by-price-quantity')
  @ApiOperation({
    summary: '根據價格範圍和存貨數量篩選藥局',
    description:
      '列出提供指定價格範圍內口罩產品數量的所有藥局，其中數量高於、低於或介於給定門檻之間。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得符合條件的藥局和商品資訊',
    type: [PriceQuantityFilterResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或參數邏輯衝突',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  async getPharmaciesByPriceAndQuantity(
    @Body() filterDto: PriceQuantityFilterDto,
  ): Promise<PriceQuantityFilterResponseDto[]> {
    return await this.storeService.getPharmaciesByPriceAndQuantity(filterDto);
  }

  @ApiTags('Stores / Analytics')
  @Post('top-spenders')
  @ApiOperation({
    summary: '取得特定日期範圍內花費最多的前 N 位使用者',
    description:
      '查詢在指定時間範圍內購買口罩總花費最高的前 N 位使用者，包含其詳細消費記錄。如果結束日期只提供日期部分（如 "2024-12-31"），系統會自動設定為當天的 23:59:59.999，確保包含整天的數據。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得前 N 位消費使用者資訊',
    type: TopSpendersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或日期範圍無效',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  async getTopSpenders(
    @Body() filterDto: TopSpendersFilterDto,
  ): Promise<TopSpendersResponseDto> {
    return await this.storeService.getTopSpenders(filterDto);
  }

  @ApiTags('Stores / Purchase')
  @Post('purchase')
  @ApiOperation({
    summary: '批量購買口罩',
    description:
      '處理使用者從多家藥局購買口罩的流程。使用者提供藥局 ID、口罩 ID 和購買數量，系統會從使用者的現金餘額中扣除相應金額，同時更新藥局的現金餘額和口罩庫存數量，最後更新使用者的購買歷史記錄。所有操作會在資料庫事務中執行以確保資料一致性。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功完成批量購買',
    type: BulkPurchaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤、使用者餘額不足或庫存不足',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的使用者、藥局或口罩類型',
  })
  async bulkPurchase(
    @Body() purchaseDto: BulkPurchaseDto,
  ): Promise<BulkPurchaseResponseDto> {
    return await this.storeService.processBulkPurchase(purchaseDto);
  }

  @ApiTags('Stores / Purchase')
  @Post('cancel-transaction')
  @ApiOperation({
    summary: '取消購買交易',
    description:
      '使用者可以提供使用者 ID 和購買歷程 ID 來取消已完成的交易。系統會驗證購買記錄是否屬於該使用者，然後將購買金額退還給使用者，從藥局餘額中扣除對應金額，並將商品庫存數量回復到購買前的狀態。同時將交易記錄的狀態更新為已取消。所有操作會在資料庫事務中執行以確保資料一致性。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取消交易',
    type: CancelTransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '交易已被取消或狀態不允許取消',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的使用者或購買記錄不屬於該使用者',
  })
  async cancelTransaction(
    @Body() cancelDto: CancelTransactionDto,
  ): Promise<CancelTransactionResponseDto> {
    return await this.storeService.cancelTransaction(cancelDto);
  }

  @ApiTags('Stores / Administration')
  @Post('update-user-balance')
  @UseGuards(RolesGuard) // 額外的管理員權限檢查
  @Roles('admin')
  @ApiOperation({
    summary: '管理員更新使用者現金餘額',
    description:
      '允許管理員直接編輯使用者的現金餘額。此功能需要管理員權限，系統會記錄是哪位管理員執行了此操作。所有操作會在資料庫事務中執行以確保資料一致性。需要 JWT 驗證和管理員角色。',
  })
  @ApiResponse({
    status: 200,
    description: '成功更新使用者餘額',
    type: UpdateUserBalanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或餘額不能為負數',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 403,
    description: '權限不足，需要管理員權限',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的使用者',
  })
  async updateUserBalance(
    @Body() updateDto: UpdateUserBalanceDto,
    @Request() req: any,
  ): Promise<UpdateUserBalanceResponseDto> {
    const adminId = req.user.sub; // 從 JWT token 中取得管理員 ID
    return await this.storeService.updateUserBalance(updateDto, adminId);
  }

  @ApiTags('Stores / Administration')
  @Post('update-inventory')
  @UseGuards(RolesGuard) // 額外的管理員權限檢查
  @Roles('admin')
  @ApiOperation({
    summary: '管理員更新藥局口罩庫存數量',
    description:
      '允許管理員直接更新指定藥局特定口罩類型的庫存數量。提供藥局 ID、口罩類型 ID 和新的庫存數量來更新庫存。此功能需要管理員權限。所有操作會在資料庫事務中執行以確保資料一致性。需要 JWT 驗證和管理員角色。',
  })
  @ApiResponse({
    status: 200,
    description: '成功更新庫存數量',
    type: UpdateInventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或庫存數量不能為負數',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 403,
    description: '權限不足，需要管理員權限',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的藥局、口罩類型或庫存記錄',
  })
  async updateInventory(
    @Body() updateDto: UpdateInventoryDto,
  ): Promise<UpdateInventoryResponseDto> {
    return await this.storeService.updateInventory(updateDto);
  }

  @ApiTags('Stores / Administration')
  @Post('bulk-upsert-products')
  @UseGuards(RolesGuard) // 額外的管理員權限檢查
  @Roles('admin')
  @ApiOperation({
    summary: '管理員批量新增或更新藥局口罩產品',
    description:
      '允許管理員為指定藥局批量新增或更新多個口罩產品，包括口罩類型資訊（品牌、顏色、包裝規格、顯示名稱）以及庫存資訊（價格、數量）。系統會根據提供的資料自動判斷是新增還是更新操作。如果提供了 mask_type_id，則會更新現有的口罩類型；如果沒有提供，系統會檢查是否已存在相同的口罩類型（根據品牌、顏色、包裝規格）。此功能需要管理員權限。所有操作會在資料庫事務中執行以確保資料一致性。需要 JWT 驗證和管理員角色。',
  })
  @ApiResponse({
    status: 200,
    description: '成功處理批量 upsert 操作',
    type: BulkUpsertMaskProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或資料驗證失敗',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  @ApiResponse({
    status: 403,
    description: '權限不足，需要管理員權限',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的藥局或口罩類型',
  })
  async bulkUpsertMaskProducts(
    @Body() upsertDto: BulkUpsertMaskProductsDto,
  ): Promise<BulkUpsertMaskProductsResponseDto> {
    return await this.storeService.bulkUpsertMaskProducts(upsertDto);
  }

  @ApiTags('Stores / Information')
  @Post('search-pharmacies-masks')
  @ApiOperation({
    summary: '搜尋藥局和口罩',
    description:
      '依名稱搜尋藥局或口罩，並依搜尋詞的相關性對結果進行排名。支援搜尋藥局名稱、口罩品牌、顏色和顯示名稱。搜尋結果會根據完全匹配、前綴匹配、包含匹配和模糊匹配進行排名。需要 JWT 驗證。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得搜尋結果',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數格式錯誤或搜尋關鍵字為空',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT token 無效或已過期',
  })
  async searchPharmaciesAndMasks(
    @Body() searchDto: SearchRequestDto,
  ): Promise<SearchResponseDto> {
    return await this.storeService.searchPharmaciesAndMasks(searchDto);
  }
}
