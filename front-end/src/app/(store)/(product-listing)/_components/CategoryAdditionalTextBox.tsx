import CategoryAdditionalTextBoxDesktop from "./CategoryAdditionalTextBoxDesktop";
import CategoryAdditionalTextBoxMobile from "./CategoryAdditionalTextBoxMobile";
import { BUYING_GUIDE_EMBEDDED_SECTION } from "./buying-guide-layout";
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
    return <section className={BUYING_GUIDE_EMBEDDED_SECTION}>{content}</section>;
  }

  return (
    <section className="product-listing-container flex-col">{content}</section>
  );
};

export default CategoryAdditionalTextBox;
