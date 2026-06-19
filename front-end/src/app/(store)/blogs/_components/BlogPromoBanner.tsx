import Image from "next/image";
import Link from "next/link";

interface BlogPromoBannerProps {
  badge: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imageAlt: string;
}

const BlogPromoBanner = ({
  badge,
  title,
  description,
  buttonLabel,
  buttonHref,
  imageUrl,
  imageAlt,
}: BlogPromoBannerProps) => (
  <aside className="blog-promo-banner rounded-xl border border-skin-neutral-100 bg-skin-white p-4 text-left shadow-card sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 lg:items-start">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg bg-skin-neutral-50 sm:mx-0 sm:h-[135px] sm:w-[180px] sm:max-w-none sm:aspect-auto">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 220px, 180px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="min-w-0 flex-1">
          <p className="!font-opensans text-[13.5px] font-bold uppercase leading-[140%] !text-skin-red-400">
            {badge}
          </p>
          <p className="mt-1 !font-opensans text-[13.5px] font-semibold leading-[150%] text-skin-neutral-500">
            {title}
          </p>
          <p className="mt-1 !font-opensans text-[13.5px] leading-[150%] text-skin-neutral-400">
            {description}
          </p>
        </div>

        <Link
          href={buttonHref}
          className="btn inline-flex h-11 w-full shrink-0 items-center justify-center bg-skin-red-400 px-5 text-content-1 font-bold uppercase text-skin-white sm:w-auto"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  </aside>
);

export default BlogPromoBanner;
