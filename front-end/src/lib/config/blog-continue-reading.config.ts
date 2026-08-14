export const BLOG_CONTINUE_READING_TEST_MODE = false;

export interface ContinueReadingArticle {
  category: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
}

export const DEFAULT_CONTINUE_READING = {
  subtitle:
    "Hand-picked next reads from the VapeHub Geek Zone — all real, currently live VapeHub articles.",
  articles: [
    {
      category: "E-LIQUID GUIDE",
      title: "Top 10 Vital Tips for New Vapers on E-Liquid",
      description:
        "The essentials: nicotine strengths, PG/VG ratios, flavour fatigue and storage — everything to know before your first bottle.",
      href: "/blogs",
      ctaLabel: "READ THE GUIDE",
      imageUrl: "/images/blog-list-card.jpg",
      imageAlt: "E-liquid guide",
    },
    {
      category: "HOW TO",
      title: "How to Dispose of Disposable Vapes",
      description:
        "The correct way to recycle a disposable in the UK — what councils accept, what retailers take back, and what never goes in general waste.",
      href: "/blogs",
      ctaLabel: "READ THE HOW-TO",
      imageUrl: "/images/blog-list-card.jpg",
      imageAlt: "Disposable vape disposal guide",
    },
    {
      category: "VAPING TECHNIQUE",
      title: "Mastering MTL: Mouth-to-Lung Vaping",
      description:
        "The technique most ex-smokers find smoothest — what MTL means, which devices suit it, and the e-liquid strengths that work best.",
      href: "/blogs",
      ctaLabel: "READ THE GUIDE",
      imageUrl: "/images/blog-list-card.jpg",
      imageAlt: "MTL vaping technique guide",
    },
  ] satisfies ContinueReadingArticle[],
};
