import { TemplatesPageClient } from '@/components/templates/TemplatesPageClient';
import { getPublicTemplates } from '@/lib/public-data';

export default async function TemplatesPage() {
  const templates = await getPublicTemplates();

  return <TemplatesPageClient initialApiTemplates={templates} />;
}
