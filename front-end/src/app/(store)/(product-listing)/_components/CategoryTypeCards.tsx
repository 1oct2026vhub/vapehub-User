type CategoryTypeCardsProps = {
  html?: string | null;
};

/**
 * Renders `type_cards_html` from slug-relation.
 * Desktop: exact API/CKEditor HTML + inline styles.
 * Mobile: `.type-cards` / `.vss-related-cards` layout only (globals.css).
 */
const CategoryTypeCards = ({ html }: CategoryTypeCardsProps) => {
  const markup = html?.trim();
  if (!markup) return null;

  return (
    <section className="product-listing-container flex-col">
      <div
        className="type-cards-html w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </section>
  );
};

export default CategoryTypeCards;
