export const BLOG_AUTHOR_BIO_TEST_MODE = false;

export const DEFAULT_AUTHOR_BIO = {
  bio: "Part of the VapeHub product team. Writes the Geek Zone's hands-on guides covering e-liquid, devices, and storage — drawing on what we see come through the warehouse every day.",
  articlesHref: "/blogs",
  teamHref: "/contact",
  articlesLabel: "All articles by",
  teamLabel: "Meet the team",
} as const;

export const getAuthorDisplayName = (
  author?: { first_name?: string | null; last_name?: string | null } | null,
  fallback = "VapeHub",
) => [author?.first_name, author?.last_name].filter(Boolean).join(" ").trim() || fallback;

export const getAuthorArticlesHeading = (authorName: string) =>
  `${DEFAULT_AUTHOR_BIO.articlesLabel} ${authorName}`;
