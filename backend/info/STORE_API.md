# Phantom Mask API Documentation

## 概述

Phantom Mask API 提供藥局管理系統的完整功能，包括用戶認證和商店資訊管理。

## 認證

### 1. 登入取得 Token

**POST** `/auth/login`

使用用戶名和密碼登入，成功後返回 JWT token。

#### 請求

```json
{
  "username": "testuser",
  "password": "password123"
}
```

#### 可用的測試帳號

- **admin** / **admin123** - 管理員帳號
- **testuser** / **password123** - 測試用戶
- **pharmacist** / **pharma2024** - 藥師帳號

#### 成功回應 (201)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "user-002",
    "username": "testuser"
  }
}
```

#### 錯誤回應

**400 Bad Request** - 請求格式錯誤
```json
{
  "statusCode": 400,
  "message": ["password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```

**401 Unauthorized** - 用戶名或密碼錯誤
```json
{
  "statusCode": 401,
  "message": "用戶名或密碼錯誤"
}
```

### 2. 使用 Token

所有需要認證的 API 請求都需要在 Header 中包含 JWT token：

```
Authorization: Bearer <your-jwt-token>
```

## API 端點

### 1. 取得所有商店資訊

**GET** `/stores`

取得所有藥局的詳細資訊，包括庫存和營業時間。

#### 回應範例

```json
[
  {
    "pharmacy_id": "uuid-string",
    "name": "示範藥局",
    "cash_balance": 50000.00,
    "opening_hours": "平日 9:00-18:00",
    "inventories": [
      {
        "inventory_id": "uuid-string",
        "price": 25.50,
        "quantity": 100,
        "maskType": {
          "mask_type_id": "uuid-string",
          "brand": "3M",
          "color": "藍色",
          "pack_size": "50片裝",
          "display_name": "3M 藍色醫療口罩 (50片裝)"
        }
      }
    ],
    "pharmacyHours": [
      {
        "schedule_id": "uuid-string",
        "open_time": "09:00:00",
        "close_time": "18:00:00",
        "is_overnight": false,
        "weekday": {
          "weekday_id": "uuid-string",
          "name": "星期一",
          "short_name": "一"
        }
      }
    ]
  }
]
```

### 2. 取得特定商店資訊

**GET** `/stores/:id`

根據商店 UUID 取得特定藥局的詳細資訊。

#### 參數

- `id` (string): 商店的 UUID

#### 回應

成功時回應單一商店物件（格式同上），找不到時回應 404 錯誤。

## 錯誤回應

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "找不到 ID 為 {id} 的商店"
}
```

## 使用範例

### 1. 登入取得 Token

```bash
# 使用測試腳本
node test-login.js testuser password123

# 或使用 cURL
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### 2. 使用 Token 存取商店 API

```bash
# 取得所有商店
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/stores

# 取得特定商店
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/stores/store-uuid-here
```

### JavaScript 範例

```javascript
// 1. 登入
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();

// 2. 使用 token 存取 API
const storesResponse = await fetch('http://localhost:3000/stores', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});

const stores = await storesResponse.json();
console.log(stores);
```

## 開發工具

### 產生 JWT Token (舊方法)
```bash
node generate-token.js
```

### 測試登入功能
```bash
node test-login.js [username] [password]
```

### Swagger API 文檔
啟動服務器後訪問：http://localhost:3000/api/docs

## 開發注意事項

1. JWT token 預設有效期為 24 小時
2. 資料庫關聯查詢包含口罩類型和營業時間詳細資訊
3. 回應資料按照商店名稱和口罩類型名稱排序
4. 所有價格欄位使用 DECIMAL 型態，保持精確度