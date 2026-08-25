import Image from "next/image";
import Link from "next/link";
import { ContinueReadingArticle } from "@/lib/config/blog-continue-reading.config";

type BlogContinueReadingCardProps = ContinueReadingArticle;

const BlogContinueReadingCard = ({
  category,
  title,
  description,
  href,
  ctaLabel,
  imageUrl,
  imageAlt,
}: BlogContinueReadingCardProps) => (
  <article className="flex h-full flex-col overflow-hidden rounded-xl bg-skin-white shadow-card">
    <div className="relative h-44 w-full bg-skin-neutral-50">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
    </div>

    <div className="flex flex-1 flex-col p-4 md:p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-skin-red-400">
        {category}
      </p>
      <h3 className="mt-2 font-oswald text-title-1 font-semibold leading-snug text-skin-primary-500">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[150%] text-skin-neutral-400">
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center text-[13.5px] font-bold uppercase text-skin-primary-500"
      >
        {ctaLabel} <span aria-hidden className="ml-1">&rarr;</span>
      </Link>
    </div>
  </article>
);

export default BlogContinueReadingCard;
