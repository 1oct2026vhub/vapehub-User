import Link from "next/link";
import { BlogSourceItem } from "@/lib/config/blog.config";

interface BlogSourcesSectionProps {
  sources: BlogSourceItem[];
}

const BlogSourcesSection = ({ sources }: BlogSourcesSectionProps) => (
  <section className="blog-sources rounded-xl bg-skin-neutral-50 p-4 sm:p-5 md:p-6" aria-label="Sources and further reading">
    <h2 className="text-[11px] font-bold uppercase tracking-wide text-skin-neutral-400">
      Sources &amp; further reading
    </h2>

    <ol className="!mt-4 !list-decimal !pl-5 space-y-3">
      {sources.map((source, index) => (
        <li
          key={`${source.href}-${index}`}
          id={`s${index + 1}`}
          className="text-[13.5px] leading-[150%] text-skin-neutral-400"
        >
          <Link
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-skin-primary-500 underline"
          >
            {source.label}
          </Link>
          {source.description ? <span> — {source.description}</span> : null}
        </li>
      ))}
    </ol>
  </section>
);

export default BlogSourcesSection;
