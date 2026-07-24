export interface CategoryBuyingGuideTab {
  id: string;
  label: string;
  heading: string;
  contentHtml: string;
}

export interface CategoryBuyingGuideData {
  label?: string;
  title?: string;
  highlights: string[];
  contentHtml: string;
  imageUrl?: string;
  imageAlt?: string;
  tabs?: CategoryBuyingGuideTab[];
  defaultTabId?: string;
}

export const DEFAULT_CATEGORY_BUYING_GUIDE_LABEL = "Buying Guide";

export const CATEGORY_BUYING_GUIDE_MEDIA_WIDTH = 903;
export const CATEGORY_BUYING_GUIDE_MEDIA_HEIGHT = 355.38;

const PREFILLED_POD_KITS_TABS: CategoryBuyingGuideTab[] = [
  {
    id: "flavours",
    label: "Flavours",
    heading: "Hayati Pro Max Plus Flavours",
    contentHtml: `<p>The Hayati Pro Max Plus range covers a wide selection of flavour profiles to suit most tastes. Popular categories include:</p>
<ul>
<li>Fruity blends</li>
<li>Menthol and ice options</li>
<li>Candy-style flavours</li>
<li>Beverage-inspired options</li>
</ul>`,
  },
  {
    id: "key-features",
    label: "Key Features",
    heading: "Key Features",
    contentHtml: `<p>Prefilled pod kits combine a rechargeable battery with replaceable prefilled pods. Most models in this category offer long-lasting puff counts, USB-C charging, and draw-activated firing with no buttons to press.</p>`,
  },
  {
    id: "compatibility",
    label: "Compatibility",
    heading: "Compatibility",
    contentHtml: `<p>Pods are device-specific — always match the prefilled pod to the correct kit model. Hayati Pro Max Plus pods are designed exclusively for the Hayati Pro Max Plus battery unit.</p>`,
  },
  {
    id: "why-choose",
    label: "Why Choose",
    heading: "Why Choose Prefilled Pod Kits",
    contentHtml: `<p>Prefilled pod kits offer a lower running cost than disposables while keeping the same simplicity. Swap a pod when it runs out — no refilling, no coil changes, no mess.</p>`,
  },
  {
    id: "quality",
    label: "Quality",
    heading: "Quality & Compliance",
    contentHtml: `<p>All devices sold at VapeHub are TPD-compliant and sourced from authorised UK distributors. We rotate stock regularly to ensure fresh batches.</p>`,
  },
];

const PREFILLED_POD_KITS_GUIDE: CategoryBuyingGuideData = {
  highlights: ["50+ Flavours", "6000 Puffs", "MIX & MATCH 3 FOR £30"],
  contentHtml: `<p>Prefilled pod kits are one of the most straightforward ways to vape. A <a href="/prefilled-pod-kits">pod kit</a> pairs a rechargeable battery with <a href="/prefilled-pods">prefilled pods</a> that click straight in — no refilling, no coil changes, and none of the waste of a single-use disposable. You get the convenience of a disposable with the lower running cost of a reusable device.</p>
<p>Most prefilled pod kits sit in the <a href="/6000-puff-vapes">6000 Puff Vapes</a> to <a href="/15000-puff-vapes">15000 Puff Vapes</a> range, with some newer models pushing <a href="/30000-puff-vapes">30000 Puff Vapes</a>. They are almost always <a href="/mtl-pod-kits">MTL Pod Kits</a> (mouth-to-lung), which means a tighter draw and higher nicotine strengths — the style most ex-smokers find closest to a cigarette.</p>`,
  imageAlt: "Hayati Pro Max prefilled pod kits",
  tabs: PREFILLED_POD_KITS_TABS,
  defaultTabId: "flavours",
};

export const CATEGORY_BUYING_GUIDE_BY_SLUG: Record<string, CategoryBuyingGuideData> = {
  "prefilled-pod-kits": PREFILLED_POD_KITS_GUIDE,
  "prefilled-pod-kit": PREFILLED_POD_KITS_GUIDE,
  "prefilled-pods": PREFILLED_POD_KITS_GUIDE,
  "prefilled-pod": PREFILLED_POD_KITS_GUIDE,
};

export const PREFILLED_POD_KITS_GUIDE_TEMPLATE = PREFILLED_POD_KITS_GUIDE;

function buildDefaultCategoryTabs(categoryName: string): CategoryBuyingGuideTab[] {
  const categoryLabel = categoryName.trim() || "this category";

  return [
    {
      id: "overview",
      label: "Overview",
      heading: `${categoryLabel} Overview`,
      contentHtml: `<p>Our ${categoryLabel} range brings together popular devices and formats from trusted brands — all TPD-compliant and sourced through authorised UK supply chains.</p>`,
    },
    {
      id: "key-features",
      label: "Key Features",
      heading: "Key Features",
      contentHtml: `<p>Browse ${categoryLabel} by puff count, flavour range, nicotine strength, and deal offers. Use the filters above to narrow products by brand, price, or attributes.</p>`,
    },
    {
      id: "compatibility",
      label: "Compatibility",
      heading: "Compatibility",
      contentHtml: `<p>Always match pods, coils, and refills to the correct device model. Check individual product pages for compatibility notes before you buy.</p>`,
    },
    {
      id: "why-choose",
      label: "Why Choose",
      heading: `Why Choose ${categoryLabel}`,
      contentHtml: `<p>VapeHub stocks ${categoryLabel} from leading manufacturers with competitive pricing, regular promotions, and fast UK delivery on qualifying orders.</p>`,
    },
    {
      id: "quality",
      label: "Quality",
      heading: "Quality & Compliance",
      contentHtml: `<p>All products sold at VapeHub are TPD-compliant and sourced from authorised UK distributors. We rotate stock regularly to keep batches fresh.</p>`,
    },
  ];
}

export function createDefaultCategoryBuyingGuide({
  categoryName,
  categoryDescription,
  categoryFeature,
  dealsText,
  imageUrl,
  imageAlt,
}: {
  categoryName: string;
  categoryDescription?: string;
  categoryFeature?: string;
  dealsText?: string;
  imageUrl?: string;
  imageAlt?: string;
}): CategoryBuyingGuideData {
  const title = categoryName.trim() || "Category";
  const featureHighlights = (categoryFeature ?? "")
    .split(/[|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  const dealHighlight = dealsText?.trim();
  const highlights =
    featureHighlights.length >= 3
      ? featureHighlights
      : [
          featureHighlights[0] || "UK Stock",
          featureHighlights[1] || "Top Brands",
          dealHighlight || featureHighlights[2] || "Fast Delivery",
        ].slice(0, 3);

  const description = categoryDescription?.trim();
  const contentHtml =
    description ||
    `<p>Explore our ${title} range at VapeHub. All products are TPD-compliant and sourced from authorised UK distributors, with competitive prices and deals updated regularly.</p>`;

  return {
    label: DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
    title,
    highlights,
    contentHtml,
    imageUrl: imageUrl?.trim() || undefined,
    imageAlt: imageAlt?.trim() || title,
    tabs: buildDefaultCategoryTabs(title),
    defaultTabId: "overview",
  };
}
