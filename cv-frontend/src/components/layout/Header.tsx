'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, FileText, Menu, X, ShieldCheck, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <>
      <motion.header 
        className={`sticky top-0 z-[140] border-b transition-all ${
          scrolled 
            ? "bg-background/85 backdrop-blur-md shadow-sm border-border" 
            : "bg-background border-border"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl">
            <Image
              src="/logo.png?v=2"
              alt="CV Builder"
              width={64}
              height={64}
              quality={100}
              priority
              unoptimized
              className="h-8 w-8 rounded-full object-contain drop-shadow-sm"
            />
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent hover:from-blue-800 hover:to-blue-600 transition-all">
              CV Builder
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/templates" 
              className="text-sm font-semibold text-foreground/80 hover:text-blue-600 transition-colors relative group"
            >
              Mẫu CV
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
            </Link>
            {isAuthenticated && (
              <Link 
                href="/my-cvs" 
                className="text-sm font-semibold text-foreground/80 hover:text-blue-600 transition-colors relative group"
              >
                CV Của Tôi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm font-semibold text-foreground/80 hover:text-blue-600 transition-colors relative group"
              >
                Admin
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Chuyển chế độ sáng/tối"
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className="rounded-full"
              disabled={!mounted}
            >
              {!mounted ? (
                <Moon className="h-4 w-4 opacity-0" />
              ) : isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {!isLoading && (
              <div className="flex items-center gap-2">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2.5 font-semibold">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-sm font-bold">
                          {user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="max-w-32 truncate">{user.fullName || user.email}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
                      <DropdownMenuLabel className="space-y-0.5 px-3 py-2.5">
                        <p className="text-sm font-semibold truncate">{user.fullName || 'Người dùng'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push('/my-cvs')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        CV của tôi
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push('/admin')}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Quản trị
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)} className="font-semibold">
                      Đăng nhập
                    </Button>
                    <Button size="sm" onClick={() => setAuthOpen(true)} className="font-semibold shadow-md hover:shadow-lg transition-shadow">
                      Bắt đầu
                    </Button>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-left text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                >
                  {!mounted ? 'Đổi giao diện' : isDarkMode ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
                </button>
                <Link 
                  href="/templates" 
                  className="px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mẫu CV
                </Link>
                {isAuthenticated && (
                  <Link 
                    href="/my-cvs" 
                    className="px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    CV Của Tôi
                  </Link>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Quản trị
                  </Link>
                )}
                {isAuthenticated && (
                  <button
                    type="button"
                    className="px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleLogout();
                    }}
                  >
                    Đăng xuất
                  </button>
                )}
                {!isLoading && !isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
                      className="w-full font-semibold"
                    >
                      Đăng nhập
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
                      className="w-full font-semibold"
                    >
                      Bắt đầu
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
