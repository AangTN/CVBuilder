import { FeatureBento } from "@/components/home/FeatureBento";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ChooseCVStyle } from "@/components/home/ChooseCVStyle";
import { getPublicTemplates } from "@/lib/public-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CV Builder",
  url: siteUrl,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CV Builder",
  url: siteUrl,
  inLanguage: "vi-VN",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/templates?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  const templates = await getPublicTemplates();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <HomeHero />
      <ChooseCVStyle initialTemplates={templates} />
      <FeatureBento />
      <HowItWorks />
      <HomeFinalCta />
    </>
  );
}