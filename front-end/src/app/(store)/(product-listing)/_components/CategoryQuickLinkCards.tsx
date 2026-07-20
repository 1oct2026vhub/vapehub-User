import DesignTypeButtons from "./DesignTypeButtons";

type CategoryQuickLinkCardsProps = {
  slug: string;
};

/** @deprecated Prefer DesignTypeButtons — same related_links API. */
const CategoryQuickLinkCards = ({ slug }: CategoryQuickLinkCardsProps) => (
  <DesignTypeButtons slug={slug} />
);

export default CategoryQuickLinkCards;
