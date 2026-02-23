import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trình Chỉnh Sửa CV Online - CV Builder',
  description: 'Công cụ tạo và chỉnh sửa CV trực tuyến với giao diện kéo thả, hỗ trợ AI gợi ý nội dung và xem trước thời gian thực.',
  robots: {
    index: false, // Don't index the editor page content
    follow: false,
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
