type CategoryTypeCardsProps = {
  html?: string | null;
};

/**
 * Renders `type_cards_html` from slug-relation (vss-related-cards).
 * Separate from related collections (`related_links`).
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
