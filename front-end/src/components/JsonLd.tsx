type JsonLdProps = {
  /** Single schema object or array of schema objects (combined into one script). */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Serialize JSON-LD for embedding in <script type="application/ld+json">.
 * JSON.stringify alone does not escape <, >, &, or line separators, so a crafted
 * product/brand name like </script><script>... can break out of the tag (stored XSS).
 * Unicode escapes keep the payload valid JSON while neutralizing HTML parsing.
 */
function serializeJsonLd(data: JsonLdProps['data']): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Renders JSON-LD structured data as a script tag. Accepts either one schema object
 * or an array of schemas (e.g. Product, BreadcrumbList, FAQPage) for a single script block.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
