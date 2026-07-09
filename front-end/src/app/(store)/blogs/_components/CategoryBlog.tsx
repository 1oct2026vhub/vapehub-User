import BreadCrumbs from "@/components/BreadCrumbs";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import FAQSection from "@/components/FAQSection";
import { ServerActionStatus } from "@/lib/config/app.config";
import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import { getTrustpilotReviews } from "@/lib/server.actions";
import Image from "next/image";
import { Suspense } from "react";
import SuspenseLoader from "@/components/ui/SuspenseLoader";
import {
  ensureBlogBodySegments,
  extractAndStripBlogSources,
  injectBlogHeadingIds,
  normalizeBlogCitationLinks,
  parseBlogBodySegments,
  prepareBlogHtml,
  processBlogBodyHtml,
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

interface CategoryBlogsProps {
  data: BlogByCategoryAndSlugResponse;
}

const processBlogContent = (html: string): string => {
  return html.replace(/<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi, (match, before, href, after) => {
    if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#|\/)/)) {
      return `<a ${before || ""}href="/${href}"${after || ""}>`;
    }
    return match;
  });
};

const CategoryBlogs = async ({ data }: CategoryBlogsProps) => {
  if (!data) {
    return <EmptyPlaceholder title="Uh, oh!" description="No blogs found" />;
  }

  const trustResponse = await getTrustpilotReviews();
  const trustStats =
    trustResponse.status === ServerActionStatus.SUCCESS
      ? trustResponse.data?.overallStats
      : null;
  const trustStars =
    trustStats?.scoreBreakdown?.stars ?? trustStats?.averageRating ?? 4.8;
  const trustTotalReviews = trustStats?.totalReviews ?? 12000;

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
  const { introHtml, bodyHtml } = splitBlogIntroAndBody(preparedContent);
  const { html: bodyWithoutSources, sources: cmsSources } = extractAndStripBlogSources(bodyHtml);
  const sources = data.sources?.length ? data.sources : cmsSources;
  const processedBody = normalizeBlogCitationLinks(processBlogBodyHtml(bodyWithoutSources));
  const { html: bodyWithIds, headings } = injectBlogHeadingIds(processedBody);
  const bodySegments = ensureBlogBodySegments(parseBlogBodySegments(bodyWithIds), {
    pullQuote: data.pull_quote,
    inlineProductCard: data.inline_product_card,
  });
  const tocHeadings = headings.length >= 3 ? headings : [];

  const continueReadingArticles = await resolveContinueReadingArticles(data);

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

            {introHtml ? (
              <div
                className="blog-intro ck-content rich-text w-full max-w-full break-words text-title-2 text-skin-neutral-300"
                dangerouslySetInnerHTML={{ __html: introHtml }}
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
              stars={trustStars}
              totalReviews={trustTotalReviews}
              idPrefix="blog-trust-inline"
            />
          </aside>
        </div>

        <aside className="blog-post-rail hidden min-w-0 blog:block">
          <BlogTrustSidebar
            stars={trustStars}
            totalReviews={trustTotalReviews}
            idPrefix="blog-trust-rail"
          />
        </aside>
      </div>

      <div className="flex min-w-0 max-w-full flex-col gap-5 border-t border-skin-neutral-100 pt-5 sm:gap-7 sm:pt-7 xl:gap-10 xl:pt-10">
        {continueReadingArticles.length > 0 ? (
          <BlogContinueReading articles={continueReadingArticles} />
        ) : null}

        <Suspense fallback={<SuspenseLoader height="h-40" />}>
          <FAQSection type="blog" id={data.id} title="Frequently Asked Questions" />
        </Suspense>
      </div>
    </main>
  );
};

export default CategoryBlogs;
