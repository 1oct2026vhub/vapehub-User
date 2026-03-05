type JsonLdProps = {
  /** Single schema object or array of schema objects (combined into one script). */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders JSON-LD structured data as a script tag. Accepts either one schema object
 * or an array of schemas (e.g. Product, BreadcrumbList, FAQPage) for a single script block.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
