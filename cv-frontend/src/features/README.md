# Features

Thư mục này chứa các feature modules, bao gồm API services và business logic theo từng tính năng.

## Cấu trúc

```
features/
├── api.ts           # API service chung
└── auth/            # Auth feature (tương lai)
    ├── api.ts
    ├── types.ts
    └── hooks.ts
```

## API Service hiện có

### API Service (`api.ts`)

Service chính để gọi backend APIs.

**Import:**
```tsx
import { api } from '@/features/api';
```

**Sử dụng:**
```tsx
// Register
const response = await api.register({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'Nguyễn Văn A'
});

// Login
const response = await api.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get Profile (với access token)
const profile = await api.getProfile(accessToken);

// Logout
await api.logout(refreshToken);

// Refresh Token
const { accessToken } = await api.refreshToken(refreshToken);
```

**Error Handling:**
```tsx
import { type ApiError } from '@/features/api';

try {
  await api.login({ email, password });
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message);
  console.error(apiError.statusCode);
}
```

## Tổ chức theo Feature

Mỗi feature nên có cấu trúc riêng:

**File:** `features/templates/api.ts`

```typescript
export interface Template {
  id: string;
  name: string;
  description: string;
}

class TemplateAPI {
  async getTemplates(): Promise<Template[]> {
    const response = await fetch('/api/templates');
    return response.json();
  }

  async getTemplateById(id: string): Promise<Template> {
    const response = await fetch(`/api/templates/${id}`);
    return response.json();
  }

  async createTemplate(data: Omit<Template, 'id'>): Promise<Template> {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const templateAPI = new TemplateAPI();
```

### Sử dụng trong component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { templateAPI, type Template } from '@/features/templates/api';

export function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await templateAPI.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {templates.map(template => (
        <li key={template.id}>{template.name}</li>
      ))}
    </ul>
  );
}
```

## Feature Module Pattern

```
features/
├── api.ts              # Shared API service
└── templates/          # Template feature
    ├── api.ts          # Template API calls
    ├── types.ts        # Template types
    ├── hooks.ts        # useTemplates, useTemplate
    └── utils.ts        # Template utilities
```

## Best Practices

### ✅ DO

- Tách API calls ra khỏi components theo features
- Sử dụng TypeScript interfaces cho request/response
- Xử lý errors một cách nhất quán
- Retry logic cho network failures
- Cache responses khi phù hợp
- Log errors để debug
- Tổ chức theo feature modules

### ❌ DON'T

- Đừng gọi API trực tiếp trong components
- Đừng hardcode URLs (dùng environment variables)
- Đừng bỏ qua error handling
- Đừng lưu sensitive data trong localStorage
- Đừng expose API keys trong client code

## Feature-Based Architecture

```
Components → Features → APIs → Backend
```

**Lợi ích:**
- Tái sử dụng logic theo features
- Dễ test (mock API modules)
- Centralized error handling
- Type safety với TypeScript
- Dễ maintain và scale
- Tổ chức code rõ ràng theo tính năng

## API Configuration

File `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Lưu ý:** Chỉ biến bắt đầu với `NEXT_PUBLIC_` mới accessible ở client-side.

## Authentication với Features

Features tự động gửi access token nếu được cung cấp:

```typescript
// Trong feature API
class MyAPI {
  async getProtectedData(accessToken: string) {
    return fetch('/api/protected', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
}
```

Hoặc sử dụng với useAuth:

```tsx
import { useAuth } from '@/context/AuthContext';
import { myAPI } from '@/features/my-feature/api';

function MyComponent() {
  const { accessToken } = useAuth();

  const loadData = async () => {
    if (accessToken) {
      const data = await myAPI.getProtectedData(accessToken);
    }
  };
}
```

## Testing Features

```typescript
import { api } from '@/features/api';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
    ok: true,
  })
) as jest.Mock;

describe('API Feature', () => {
  it('should login successfully', async () => {
    const response = await api.login({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(response).toBeDefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.any(Object)
    );
  });
});
```

## Tài liệu tham khảo

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Modular Architecture](https://martinfowler.com/articles/modular-monolith.html)
