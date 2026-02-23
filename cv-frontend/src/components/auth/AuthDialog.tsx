'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { type ApiError } from '@/features/api';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = 'login' | 'register';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    use_fedcm_for_prompt: boolean;
    auto_select: boolean;
    callback: (response: GoogleCredentialResponse) => Promise<void>;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      type: string;
      theme: string;
      size: string;
      text: string;
      shape: string;
      locale: string;
      width: number;
    },
  ) => void;
  prompt: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, loginWithGoogle, register } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isGoogleButtonRendered, setIsGoogleButtonRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement | null;

    const initializeGoogle = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT;
      const googleClient = window.google;

      if (!clientId || !googleClient?.accounts?.id) {
        return;
      }

      googleClient.accounts.id.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: false,
        auto_select: false,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setError('Không nhận được token từ Google. Vui lòng thử lại.');
            return;
          }

          setIsLoading(true);
          setError(null);

          try {
            await loginWithGoogle(response.credential);
            setSuccess('Đăng nhập Google thành công!');
            setTimeout(() => {
              onOpenChange(false);
              resetForm();
            }, 700);
          } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Đăng nhập Google thất bại.');
          } finally {
            setIsLoading(false);
          }
        },
      });

      setIsGoogleReady(true);
    };

    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogle();
      } else {
        existingScript.addEventListener('load', initializeGoogle, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [loginWithGoogle, onOpenChange]);

  useEffect(() => {
    if (!open || !isGoogleReady || !googleButtonRef.current) {
      return;
    }

    const googleClient = window.google;

    if (!googleClient?.accounts?.id) {
      setIsGoogleButtonRendered(false);
      return;
    }

    googleButtonRef.current.innerHTML = '';
    googleClient.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      locale: 'vi',
      width: 360,
    });

    setIsGoogleButtonRendered(googleButtonRef.current.childElementCount > 0);
  }, [open, isGoogleReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Đăng nhập thành công!');
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 1000);
      } else {
        await register(formData.email, formData.password, formData.name || undefined);
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
          setFormData({ ...formData, password: '' });
        }, 2000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const handleGoogleFallbackLogin = () => {
    setError(null);

    const googleClient = window.google;

    if (!googleClient?.accounts?.id) {
      setError('Google Login chưa sẵn sàng. Vui lòng tải lại trang.');
      return;
    }

    googleClient.accounts.id.prompt();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <DialogHeader className="border-b bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Chào mừng quay lại' : 'Tạo tài khoản mới'}
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm">
            {mode === 'login'
              ? 'Đăng nhập để tiếp tục chỉnh sửa và lưu CV của bạn.'
              : 'Tạo tài khoản để đồng bộ và quản lý CV trên mọi thiết bị.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  Mật khẩu phải có ít nhất 6 ký tự
                </p>
              )}
            </div>

            <Button type="submit" className="h-11 w-full font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
                </>
              ) : (
                mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {!isGoogleReady && (
            <Button type="button" variant="outline" className="h-11 w-full" disabled>
              Đang tải Google Login...
            </Button>
          )}

          <div className={isLoading ? 'pointer-events-none opacity-60' : ''}>
            <div ref={googleButtonRef} className="w-full flex justify-center" />
          </div>

          {isGoogleReady && !isGoogleButtonRendered && (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={handleGoogleFallbackLogin}
              disabled={isLoading}
            >
              Đăng nhập với Google
            </Button>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </span>{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-semibold"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
