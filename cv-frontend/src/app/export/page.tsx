import { notFound } from 'next/navigation';
import { ExportRenderClient } from './ExportRenderClient';

interface ExportPageProps {
  searchParams: Promise<{
    data?: string;
    k?: string;
  }>;
}

export default async function ExportPage({ searchParams }: ExportPageProps) {
  const params = await searchParams;
  const encodedData = params.data;
  const renderKey = params.k;
  const serverKey = process.env.EXPORT_RENDER_KEY;

  if (!encodedData || !renderKey || !serverKey || renderKey !== serverKey) {
    notFound();
  }

  return <ExportRenderClient encodedData={encodedData} />;
}
