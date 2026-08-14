import type { BlogSourceItem } from "@/lib/config/blog.config";

export const BLOG_SOURCES_TEST_MODE = false;

export type { BlogSourceItem };

export const DEFAULT_BLOG_SOURCES: BlogSourceItem[] = [
  {
    label: "Medicines and Healthcare products Regulatory Agency (MHRA)",
    href: "https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency",
    description: "e-cigarette product notification scheme & manufacturer guidance",
  },
  {
    label: "UK Vaping Industry Association (UKVIA)",
    href: "https://www.ukvia.co.uk/",
    description: "industry standards & responsible vaping guidance",
  },
  {
    label: "NHS Better Health",
    href: "https://www.nhs.uk/better-health/quit-smoking/",
    description: "official advice on vaping to quit smoking",
  },
  {
    label: "Public Health England",
    href: "https://www.gov.uk/government/organisations/public-health-england",
    description: "evidence reviews on e-cigarette safety & effectiveness",
  },
];
