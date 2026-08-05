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
      {embedded ? (
        <div className="flex w-full items-center justify-center py-3 md:py-4" aria-hidden>
          <div className="h-px w-full bg-skin-neutral-200" />
        </div>
      ) : null}
      <CategoryTypeCardsDesktop html={normalized} />
      <CategoryTypeCardsMobile html={normalized} />
    </>
  );

  if (embedded) {
    return <section className="w-full">{content}</section>;
  }

  return <section className="product-listing-container flex-col">{content}</section>;
};

export default CategoryTypeCards;
