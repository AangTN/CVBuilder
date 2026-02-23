# Auth Module - Hướng dẫn sử dụng

Module authentication với JWT cho NestJS, hỗ trợ access token, refresh token và guest token.

## Cấu trúc

```
src/modules/auth/
├── auth.module.ts              # Module chính
├── auth.service.ts             # Service xử lý authentication
├── token.service.ts            # Service xử lý token
├── auth.controller.ts          # Controller với các API endpoint
├── strategies/
│   ├── jwt.strategy.ts         # Strategy cho access token
│   ├── refresh-token.strategy.ts # Strategy cho refresh token
│   └── guest-token.strategy.ts # Strategy cho guest token
├── guards/
│   ├── jwt-auth.guard.ts       # Guard bảo vệ route với access token
│   ├── refresh-token.guard.ts  # Guard cho refresh token
│   └── guest-token.guard.ts    # Guard cho guest token
└── decorators/
    ├── public.decorator.ts     # Decorator đánh dấu route public
    └── current-user.decorator.ts # Decorator lấy thông tin user hiện tại
```

## Các hàm chính trong TokenService

### 1. `createRefreshToken(userId, userAgent?, ipAddress?)`
Tạo refresh token mới và lưu vào database.

```typescript
const refreshToken = await this.tokenService.createRefreshToken(
  userId,
  req.get('user-agent'),
  req.ip
);
```

### 2. `createAccessTokenFromRefreshToken(refreshToken)`
Tạo access token từ refresh token (kiểm tra DB).

```typescript
const accessToken = await this.tokenService.createAccessTokenFromRefreshToken(
  refreshToken
);
```

### 3. `createTokenPair(userId, userAgent?, ipAddress?)`
Tạo cả access token và refresh token cùng lúc.

```typescript
const { accessToken, refreshToken } = await this.tokenService.createTokenPair(
  userId,
  req.get('user-agent'),
  req.ip
);
```

### 4. `createGuestToken(guestEmail, cvId?)`
Tạo guest token cho user không cần đăng nhập.

```typescript
const guestToken = await this.tokenService.createGuestToken(
  'guest@example.com',
  'cv-id-123'
);
```

### 5. `validateAccessToken(token)`
Kiểm tra access token có hợp lệ không.

```typescript
try {
  const payload = await this.tokenService.validateAccessToken(token);
  console.log('Token hợp lệ:', payload);
} catch (error) {
  console.log('Token không hợp lệ');
}
```

### 6. `validateRefreshToken(token)`
Kiểm tra refresh token có hợp lệ không (kiểm tra cả DB).

```typescript
try {
  const payload = await this.tokenService.validateRefreshToken(token);
  console.log('Refresh token hợp lệ:', payload);
} catch (error) {
  console.log('Refresh token không hợp lệ');
}
```

### 7. `validateGuestToken(token)`
Kiểm tra guest token có hợp lệ không.

```typescript
try {
  const payload = await this.tokenService.validateGuestToken(token);
  console.log('Guest token hợp lệ:', payload);
} catch (error) {
  console.log('Guest token không hợp lệ');
}
```

### 8. `revokeRefreshToken(token)`
Thu hồi một refresh token (đánh dấu không còn hiệu lực).

```typescript
await this.tokenService.revokeRefreshToken(refreshToken);
```

### 9. `revokeAllUserTokens(userId)`
Thu hồi tất cả refresh tokens của một user.

```typescript
await this.tokenService.revokeAllUserTokens(userId);
```

### 10. `cleanExpiredTokens()`
Xóa các refresh token đã hết hạn từ database.

```typescript
await this.tokenService.cleanExpiredTokens();
```

## API Endpoints

### 1. POST `/auth/register`
Đăng ký tài khoản mới.

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "Nguyen Van A"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "balance": 0
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. POST `/auth/login`
Đăng nhập.

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "balance": 0,
    "role": null
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 3. POST `/auth/guest-token`
Tạo guest token cho người dùng không đăng nhập.

```bash
curl -X POST http://localhost:4000/auth/guest-token \
  -H "Content-Type: application/json" \
  -d '{
    "guestEmail": "guest@example.com",
    "cvId": "cv-uuid"
  }'
```

Response:
```json
{
  "guestToken": "eyJhbGc..."
}
```

### 4. POST `/auth/refresh`
Làm mới access token bằng refresh token.

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

Response:
```json
{
  "accessToken": "eyJhbGc..."
}
```

### 5. POST `/auth/logout`
Đăng xuất (thu hồi refresh token).

```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

### 6. GET `/auth/profile`
Lấy thông tin user hiện tại (cần access token).

```bash
curl -X GET http://localhost:4000/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": null
  }
}
```

### 7. GET `/auth/guest-profile`
Lấy thông tin guest (cần guest token).

```bash
curl -X GET http://localhost:4000/auth/guest-profile \
  -H "Authorization: Bearer <guest_token>"
```

Response:
```json
{
  "guest": {
    "guestEmail": "guest@example.com",
    "cvId": "cv-uuid",
    "type": "guest"
  }
}
```

## Sử dụng trong Controller

### Bảo vệ route với Access Token

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';

@Controller('protected')
@UseGuards(JwtAuthGuard)  // Bảo vệ toàn bộ controller
export class ProtectedController {
  @Get('data')
  getData(@CurrentUser() user: any) {
    return {
      message: 'Protected data',
      userId: user.userId,
      email: user.email,
    };
  }
}
```

### Route công khai (Public)

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()  // Route này không cần token
  @Get('data')
  getData() {
    return { message: 'Public data' };
  }
}
```

### Bảo vệ route với Guest Token

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GuestTokenGuard } from './modules/auth/guards/guest-token.guard';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';

@Controller('guest')
export class GuestController {
  @Get('cv')
  @UseGuards(GuestTokenGuard)
  getCV(@CurrentUser() guest: any) {
    return {
      guestEmail: guest.guestEmail,
      cvId: guest.cvId,
    };
  }
}
```

## Sử dụng TokenService trong Service khác

```typescript
import { Injectable } from '@nestjs/common';
import { TokenService } from './modules/auth/token.service';

@Injectable()
export class MyService {
  constructor(private tokenService: TokenService) {}

  async someMethod() {
    // Tạo token pair cho user
    const tokens = await this.tokenService.createTokenPair('user-id');
    
    // Validate access token
    const payload = await this.tokenService.validateAccessToken(
      tokens.accessToken
    );
    
    // Tạo guest token
    const guestToken = await this.tokenService.createGuestToken(
      'guest@example.com'
    );
  }
}
```

## Cấu hình Environment Variables

Đảm bảo file `.env` có các biến sau:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
ACCESS_TOKEN_SECRET="your-secret-key-for-access-token"
REFRESH_TOKEN_SECRET="your-secret-key-for-refresh-token"
GUEST_TOKEN_SECRET="your-secret-key-for-guest-token"
```

## Token Expiration

- **Access Token**: 15 phút
- **Refresh Token**: 7 ngày
- **Guest Token**: 24 giờ

## Lưu ý

1. **Refresh Token** được lưu trong database và có thể thu hồi (revoke).
2. **Access Token** có thời hạn ngắn và không lưu trong DB.
3. **Guest Token** dùng cho người dùng không cần đăng nhập, không lưu DB.
4. Nên định kỳ gọi `cleanExpiredTokens()` để xóa token hết hạn (có thể dùng cron job).
5. Khi user đăng xuất, refresh token sẽ bị revoke nhưng access token vẫn còn hiệu lực đến khi hết hạn.

## Testing

Bạn có thể test các API bằng Postman hoặc curl. Nhớ thêm header `Authorization: Bearer <token>` cho các route được bảo vệ.
