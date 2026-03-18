import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const geistSans = localFont({
  src: "../../public/font/Geist-VariableFont_wght.ttf", // Trỏ đúng vào file Tuấn vừa copy
  variable: "--font-geist-sans",
  weight: "100 900", // Khai báo tầm hoạt động của font biến thể
});

const geistMono = localFont({
  src: "../../public/font/GeistMono-VariableFont_wght.ttf", // Trỏ đúng vào file Tuấn vừa copy
  variable: "--font-geist-mono",
  weight: "100 900", // Khai báo tầm hoạt động của font biến thể
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CV Builder - Tạo CV Online Miễn Phí & Chuyên Nghiệp",
    template: "%s | CV Builder",
  },
  description:
    "Công cụ tạo CV online miễn phí hàng đầu. Chọn mẫu đẹp, viết CV chuẩn ATS, xuất PDF chất lượng cao trong vài phút. Không cần đăng ký.",
  keywords: [
    "tạo CV",
    "CV online",
    "mẫu CV đẹp",
    "CV xin việc",
    "CV tiếng Việt",
    "resume builder",
    "viết CV",
    "tạo hồ sơ xin việc",
  ],
  authors: [{ name: "CV Builder Team" }],
  creator: "CV Builder Team",
  publisher: "CV Builder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "CV Builder",
    title: "CV Builder - Tạo CV Online Miễn Phí",
    description:
      "Công cụ tạo CV online miễn phí hàng đầu. Chọn mẫu đẹp, viết CV chuẩn ATS, xuất PDF chất lượng cao trong vài phút.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CV Builder - Tạo CV Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Builder - Tạo CV Online Miễn Phí",
    description:
      "Công cụ tạo CV online miễn phí hàng đầu. Chọn mẫu đẹp, viết CV chuẩn ATS, xuất PDF chất lượng cao trong vài phút.",
    images: ["/twitter-image.png"],
    creator: "@cvbuilder",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
