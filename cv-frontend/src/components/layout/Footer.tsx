'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-10 border-t bg-gradient-to-b from-background to-blue-50/30 dark:to-slate-900/30">
      {/* Wave Separator */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-black text-xl mb-4 bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              CV Builder
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Tạo CV chuyên nghiệp trong vài phút với công cụ trực quan và dễ sử dụng của chúng tôi.
            </p>
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Twitter"
                className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-500 dark:bg-blue-950/40 dark:hover:bg-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="GitHub"
                className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-500 dark:bg-blue-950/40 dark:hover:bg-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="LinkedIn"
                className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-500 dark:bg-blue-950/40 dark:hover:bg-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Email"
                className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-500 dark:bg-blue-950/40 dark:hover:bg-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
              </motion.a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Sản Phẩm</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/templates" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Mẫu CV</span>
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Trình Chỉnh Sửa</span>
                </Link>
              </li>
              <li>
                <Link href="/my-cvs" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">CV Của Tôi</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Tài Nguyên</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Hướng Dẫn CV</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Câu Hỏi Thường Gặp</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Pháp Lý</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Chính Sách Bảo Mật</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Điều Khoản Dịch Vụ</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CV Builder. Tất cả quyền được bảo lưu.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="gap-2 font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowUp className="h-4 w-4" />
              Về Đầu Trang
            </Button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
