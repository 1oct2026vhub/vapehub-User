import CategoryAdditionalTextBoxDesktop from "./CategoryAdditionalTextBoxDesktop";
import CategoryAdditionalTextBoxMobile from "./CategoryAdditionalTextBoxMobile";
import { normalizeTypeCardsHtml } from "./type-cards.utils";

type CategoryAdditionalTextBoxProps = {
  html?: string | null;
  /** When inside Buying Guide card: top divider, no outer listing container. */
  embedded?: boolean;
};

/**
 * Renders `additional_text_box` from slug-relation (category or brand).
 * Desktop (lg+): exact API/CKEditor HTML + inline styles.
 * Mobile: nicotine / flavour card grids → one-card slick carousel (same as Related Collections).
 * Null/empty → no block.
 */
const CategoryAdditionalTextBox = ({
  html,
  embedded = false,
}: CategoryAdditionalTextBoxProps) => {
  const markup = html?.trim();
  if (!markup) return null;

  const normalized = normalizeTypeCardsHtml(markup);

  const content = (
    <>
      <CategoryAdditionalTextBoxDesktop html={normalized} />
      <CategoryAdditionalTextBoxMobile html={normalized} />
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

  return (
    <section className="product-listing-container flex-col">{content}</section>
  );
};

export default CategoryAdditionalTextBox;
