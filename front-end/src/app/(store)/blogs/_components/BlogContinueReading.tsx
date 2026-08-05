import {
  ContinueReadingArticle,
  DEFAULT_CONTINUE_READING,
} from "@/lib/config/blog-continue-reading.config";
import BlogContinueReadingCard from "./BlogContinueReadingCard";

interface BlogContinueReadingProps {
  articles: ContinueReadingArticle[];
  subtitle?: string;
}

const BlogContinueReading = ({
  articles,
  subtitle = DEFAULT_CONTINUE_READING.subtitle,
}: BlogContinueReadingProps) => {
  if (!articles.length) return null;

  return (
    <section className="blog-continue-reading w-full" aria-label="Continue reading">
      <h2 className="primary-gradient-600 text-h5 font-semibold md:text-h4">Continue reading</h2>
      <p className="mt-2 max-w-3xl text-[13.5px] leading-[150%] text-skin-neutral-400">
        {subtitle}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <BlogContinueReadingCard key={`${article.href}-${article.title}`} {...article} />
        ))}
      </div>
    </section>
  );
};

export default BlogContinueReading;
