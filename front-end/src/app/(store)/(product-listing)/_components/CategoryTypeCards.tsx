import CategoryTypeCardsMobile from "./CategoryTypeCardsMobile";
import CategoryTypeCardsDesktop from "./CategoryTypeCardsDesktop";
import { normalizeTypeCardsHtml } from "./type-cards.utils";

type CategoryTypeCardsProps = {
  html?: string | null;
  /** When inside Buying Guide card: top divider, no outer listing container. */
  embedded?: boolean;
};

/**
 * Renders `type_cards_html` from slug-relation (category or brand).
 * Desktop (lg+): exact API/CKEditor HTML + inline styles.
 * Mobile: one-card slick carousel with custom arrows + dots.
 */
const CategoryTypeCards = ({ html, embedded = false }: CategoryTypeCardsProps) => {
  const markup = html?.trim();
  if (!markup) return null;

  const normalized = normalizeTypeCardsHtml(markup);

  const content = (
    <>
      <CategoryTypeCardsDesktop html={normalized} />
      <CategoryTypeCardsMobile html={normalized} />
    </>
  );

  if (embedded) {
    return (
      <section className="w-full pt-4 md:pt-5">
        <div className="mb-4 h-px w-full bg-skin-neutral-200 md:mb-5" aria-hidden />
        {content}
      </section>
    );
  }

  return <section className="product-listing-container flex-col">{content}</section>;
};

export default CategoryTypeCards;
