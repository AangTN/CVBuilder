import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thư Viện Mẫu CV Đẹp - Chuẩn ATS & Chuyên Nghiệp',
  description:
    'Khám phá kho mẫu CV xin việc đa dạng ngành nghề (IT, Marketing, Sales...), thiết kế chuẩn ATS giúp bạn gây ấn tượng với nhà tuyển dụng ngay từ cái nhìn đầu tiên.',
  openGraph: {
    title: 'Thư Viện Mẫu CV Đẹp - Chuẩn ATS & Chuyên Nghiệp',
    description: 'Kho mẫu CV xin việc đa dạng, thiết kế chuẩn ATS.',
    type: 'website',
  },
  alternates: {
    canonical: '/templates',
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}