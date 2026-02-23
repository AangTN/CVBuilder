import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý CV Của Tôi - CV Builder',
  description: 'Danh sách và lịch sử các CV bạn đã tạo. Chỉnh sửa, tải xuống hoặc tạo mới CV dễ dàng.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyCvsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
