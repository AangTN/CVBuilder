# Context

Thư mục này chứa các React Context cho state management toàn ứng dụng.

## Contexts hiện có

### AuthContext

Quản lý authentication state (user, tokens, login, logout).

**Usage:**

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Tạo Context mới

### 1. Tạo file context

**File:** `context/ThemeContext.tsx`

```tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 2. Thêm provider vào layout

**File:** `app/layout.tsx`

```tsx
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Sử dụng trong components

```tsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

## Best Practices

### ✅ DO

- Đặt tên Context theo pattern `[Name]Context.tsx`
- Export cả Provider và custom hook
- Kiểm tra context undefined trong hook
- Sử dụng TypeScript cho type safety
- Tách logic phức tạp ra khỏi context (dùng custom hooks)

### ❌ DON'T

- Đừng lưu trữ quá nhiều state trong một context
- Đừng lạm dụng context cho state chỉ dùng trong vài components
- Đừng quên `'use client'` directive
- Đừng render lại toàn bộ app khi context thay đổi (split contexts nếu cần)

## Context vs Props

**Dùng Context khi:**
- State cần được chia sẻ ở nhiều nơi trong app
- Muốn tránh prop drilling (truyền props qua nhiều tầng)
- State quản lý global features (auth, theme, i18n, etc.)

**Dùng Props khi:**
- Component gần nhau trong tree
- Relationship rõ ràng giữa parent-child
- State đơn giản, local

## Performance Tips

### 1. Split Contexts

Thay vì một context lớn, tách thành nhiều contexts nhỏ:

```tsx
// ❌ Không tốt - một context lớn
<AppContext>
  {children}
</AppContext>

// ✅ Tốt hơn - nhiều contexts nhỏ
<AuthContext>
  <ThemeContext>
    <I18nContext>
      {children}
    </I18nContext>
  </ThemeContext>
</AuthContext>
```

### 2. Memoization

```tsx
import { useMemo } from 'react';

export function MyProvider({ children }) {
  const [state, setState] = useState(initialState);

  const value = useMemo(
    () => ({
      state,
      setState,
      // ... other values
    }),
    [state] // dependencies
  );

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
```

### 3. Split State and Actions

```tsx
const StateContext = createContext(null);
const DispatchContext = createContext(null);

// Components chỉ cần actions không re-render khi state thay đổi
```

## Tài liệu tham khảo

- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React useContext](https://react.dev/reference/react/useContext)
- [When to use Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
