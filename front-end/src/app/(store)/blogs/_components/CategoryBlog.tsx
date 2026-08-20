import { unstable_noStore as noStore } from "next/cache";
import BreadCrumbs from "@/components/BreadCrumbs";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import FAQSection from "@/components/FAQSection";
import { ServerActionStatus } from "@/lib/config/app.config";
import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import { getTrustpilotReviews } from "@/lib/server.actions";
import { ContinueReadingArticle } from "@/lib/config/blog-continue-reading.config";
import Image from "next/image";
import {
  ensureBlogBodySegments,
  extractAndStripBlogSources,
  hasBlogPlaceholders,
  hasLegacyParagraphCallouts,
  insertApiFirstPersonCallouts,
  injectBlogHeadingIds,
  normalizeBlogCitationLinks,
  parseBlogBodySegments,
  prepareBlogHtml,
  processBlogBodyHtml,
  replaceBlogPlaceholders,
  sanitizeBlogHtmlForRender,
  splitBlogIntroAndBody,
} from "@/lib/blog-content.utils";
import BlogArticleBody from "./BlogArticleBody";
import BlogAuthorBioCard from "./BlogAuthorBioCard";
import BlogAuthorMeta from "./BlogAuthorMeta";
import BlogContinueReading from "./BlogContinueReading";
import BlogSourcesSection from "./BlogSourcesSection";
import BlogTableOfContents from "./BlogTableOfContents";
import BlogTrustSidebar from "./BlogTrustSidebar";
import { resolveContinueReadingArticles } from "./blog-continue-reading.utils";

export interface CategoryBlogPageData {
  trustScore: number;
  trustTotalReviews: number;
  continueReadingArticles: ContinueReadingArticle[];
}

interface CategoryBlogsProps extends CategoryBlogPageData {
  data: BlogByCategoryAndSlugResponse;
}

export async function prepareCategoryBlogPageData(
  data: BlogByCategoryAndSlugResponse,
): Promise<CategoryBlogPageData> {
  noStore();
  const [trustResponse, continueReadingArticles] = await Promise.all([
    getTrustpilotReviews(),
    resolveContinueReadingArticles(data),
  ]);

  const trustStats =
    trustResponse.status === ServerActionStatus.SUCCESS
      ? trustResponse.data?.overallStats
      : null;

  return {
    trustScore:
      trustStats?.scoreBreakdown?.trustScore ??
      trustStats?.trustScore ??
      trustStats?.scoreBreakdown?.stars ??
      trustStats?.averageRating ??
      4.8,
    trustTotalReviews: trustStats?.totalReviews ?? 12000,
    continueReadingArticles,
  };
}

const processBlogContent = (html: string): string => {
  return html.replace(/<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi, (match, before, href, after) => {
    if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#|\/)/)) {
      return `<a ${before || ""}href="/${href}"${after || ""}>`;
    }
    return match;
  });
};

const CategoryBlogs = ({
  data,
  trustScore,
  trustTotalReviews,
  continueReadingArticles,
}: CategoryBlogsProps) => {
  noStore();

  if (!data) {
    return <EmptyPlaceholder title="Uh, oh!" description="No blogs found" />;
  }

  const category = data.categories?.[0];
  const categoryBreadcrumbs = category
    ? category.parent?.slug
      ? [
          { label: category.parent.name, href: `/${category.parent.slug}` },
          { label: category.name, href: category.slug ? `/${category.slug}` : ROUTES.BLOGS },
        ]
      : category.slug
        ? [{ label: category.name, href: `/${category.slug}` }]
        : [{ label: category.name, href: ROUTES.BLOGS }]
    : [];

  const blogHref = data.slug
    ? data.slug.startsWith("/")
      ? data.slug
      : `/${data.slug}`
    : ROUTES.BLOGS;

  const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Blogs", href: ROUTES.BLOGS },
    ...categoryBreadcrumbs,
    { label: data.title, href: blogHref, isActive: true },
  ];

  const preparedContent = processBlogContent(prepareBlogHtml(data.content));
  const usesPlaceholderPositioning = hasBlogPlaceholders(preparedContent);
  const contentWithPlaceholders = replaceBlogPlaceholders(preparedContent, {
    pullQuote: data.pull_quote,
    inlineProductCard: data.inline_product_card,
    firstPersonCallouts: data.first_person_callouts,
  });
  const hasEmbeddedCalloutMarkers = /blog-warehouse-callout/i.test(contentWithPlaceholders);
  const contentWithCallouts = hasLegacyParagraphCallouts(data.first_person_callouts)
    ? insertApiFirstPersonCallouts(contentWithPlaceholders, data.first_person_callouts)
    : contentWithPlaceholders;
  const { introHtml, bodyHtml } = splitBlogIntroAndBody(contentWithCallouts);
  const { html: bodyWithoutSources, sources: cmsSources } = extractAndStripBlogSources(bodyHtml);
  const sources = data.sources?.length ? data.sources : cmsSources;
  const processedBody = normalizeBlogCitationLinks(
    processBlogBodyHtml(bodyWithoutSources, {
      skipWarehouseHeuristics:
        usesPlaceholderPositioning || hasEmbeddedCalloutMarkers || hasLegacyParagraphCallouts(data.first_person_callouts),
    }),
  );
  const { html: bodyWithIds, headings } = injectBlogHeadingIds(processedBody);
  const safeIntroHtml = introHtml ? sanitizeBlogHtmlForRender(introHtml) : '';
  const safeBodyWithIds = sanitizeBlogHtmlForRender(bodyWithIds);
  const bodySegments = ensureBlogBodySegments(
    parseBlogBodySegments(safeBodyWithIds),
    {
      pullQuote: data.pull_quote,
      inlineProductCard: data.inline_product_card,
    },
    {
      skipHeuristicInsertion:
        usesPlaceholderPositioning ||
        hasEmbeddedCalloutMarkers ||
        /blog-industry-quote/i.test(contentWithPlaceholders) ||
        /blog-promo-banner/i.test(contentWithPlaceholders),
    },
  );
  const tocHeadings = headings.length >= 3 ? headings : [];

  return (
    <main className="blog-post-main flex max-w-full min-w-0 flex-col gap-5 px-4 py-5 sm:gap-6 sm:py-7 lg:px-9 xl:gap-10 xl:px-12.5 xl:py-10">
      <BreadCrumbs items={breadcrumbs} />

      <Image
        src={data.image_url ?? "/images/blog-list-card.jpg"}
        alt={data.alt_text ?? data.title}
        width={0}
        height={0}
        sizes="100vw"
        className="max-h-52 w-full rounded-10 object-cover sm:max-h-64 md:max-h-80"
        priority
      />

      <div
        className={`blog-post-grid grid min-w-0 max-w-full grid-cols-1 gap-6 blog:items-start blog:gap-10 ${
          tocHeadings.length > 0
            ? "blog:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,280px)]"
            : "blog:grid-cols-[minmax(0,1fr)_minmax(0,280px)]"
        }`}
      >
        {tocHeadings.length > 0 ? (
          <aside className="blog-post-rail hidden min-w-0 blog:block">
            <BlogTableOfContents headings={tocHeadings} />
          </aside>
        ) : null}

        <div className="flex min-w-0 max-w-full flex-col gap-5 sm:gap-7">
          <article className="flex min-w-0 w-full max-w-full flex-col gap-4 sm:gap-5">
            <h1 className="primary-gradient-600 mt-0 w-full max-w-full break-words text-h4 font-semibold md:text-h3 xl:text-h2">
              {data.title ?? "Blogs"}
            </h1>

            {safeIntroHtml ? (
              <div
                className="blog-intro ck-content rich-text w-full max-w-full break-words text-title-2 text-skin-neutral-300"
                dangerouslySetInnerHTML={{ __html: safeIntroHtml }}
              />
            ) : null}

            <BlogAuthorMeta
              author={data.author}
              publishedAt={data.published_at}
              updatedAt={data.updated_at}
            />

            {tocHeadings.length > 0 ? (
              <div className="blog:hidden">
                <BlogTableOfContents headings={tocHeadings} variant="mobile" />
              </div>
            ) : null}

            <BlogArticleBody segments={bodySegments} />
          </article>

          {sources.length > 0 ? <BlogSourcesSection sources={sources} /> : null}

          <BlogAuthorBioCard author={data.author} authorId={data.author_id} />

          <aside className="blog:hidden">
            <BlogTrustSidebar
              trustScore={trustScore}
              totalReviews={trustTotalReviews}
              idPrefix="blog-trust-inline"
            />
          </aside>
        </div>

        <aside className="blog-post-rail hidden min-w-0 blog:block">
          <BlogTrustSidebar
            trustScore={trustScore}
            totalReviews={trustTotalReviews}
            idPrefix="blog-trust-rail"
          />
        </aside>
      </div>

      <div className="flex min-w-0 max-w-full flex-col gap-5 border-t border-skin-neutral-100 pt-5 sm:gap-7 sm:pt-7 xl:gap-10 xl:pt-10">
        {continueReadingArticles.length > 0 ? (
          <BlogContinueReading articles={continueReadingArticles} />
        ) : null}

        <FAQSection type="blog" id={data.id} title="Frequently Asked Questions" />
      </div>
    </main>
  );
};

export default CategoryBlogs;
