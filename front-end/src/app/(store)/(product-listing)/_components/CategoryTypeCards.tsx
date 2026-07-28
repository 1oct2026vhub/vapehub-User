import CategoryTypeCardsMobile from "./CategoryTypeCardsMobile";

type CategoryTypeCardsProps = {
  html?: string | null;
  /** When inside Buying Guide card: top divider, no outer listing container. */
  embedded?: boolean;
};

/**
 * Renders `type_cards_html` from slug-relation.
 * Desktop (lg+): exact API/CKEditor HTML + inline styles.
 * Mobile: one-card slick carousel with custom arrows + dots.
 */
const CategoryTypeCards = ({ html, embedded = false }: CategoryTypeCardsProps) => {
  const markup = html?.trim();
  if (!markup) return null;

  const content = (
    <>
      {embedded ? (
        <div className="flex w-full items-center justify-center py-6 md:py-8" aria-hidden>
          <div className="h-px w-full bg-skin-neutral-200" />
        </div>
      ) : null}
      <div
        className="type-cards-html hidden w-full lg:block"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      <CategoryTypeCardsMobile html={markup} />
    </>
  );

  if (embedded) {
    return <section className="w-full">{content}</section>;
  }

  return <section className="product-listing-container flex-col">{content}</section>;
};

export default CategoryTypeCards;
