import Link from "next/link";
import Image from "next/image";
import { Author } from "@/lib/config/blog.config";
import { DEFAULT_AUTHOR_BIO } from "@/lib/config/blog-author-bio.config";
import { ROUTES } from "@/lib/routes";

interface BlogAuthorBioCardProps {
  author: Author;
  bio?: string;
  articlesHref?: string;
  teamHref?: string;
}

const BlogAuthorBioCard = ({
  author,
  bio,
  articlesHref,
  teamHref,
}: BlogAuthorBioCardProps) => {
  const authorName =
    [author.first_name, author.last_name].filter(Boolean).join(" ").trim() || "VapeHub";
  const initials = authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = author.avatar_url?.trim();
  const resolvedBio = bio?.trim() || author.bio?.trim() || DEFAULT_AUTHOR_BIO.bio;
  const resolvedArticlesHref =
    articlesHref || author.archive_url?.trim() || ROUTES.BLOGS;
  const resolvedTeamHref = teamHref || author.team_url?.trim() || ROUTES.BLOGS;

  return (
    <aside className="blog-author-bio rounded-xl border border-skin-neutral-100 bg-skin-white p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={authorName}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-skin-neutral-100 text-title-1 font-semibold text-skin-neutral-400"
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-skin-neutral-300">
            Written by
          </p>
          <p className="mt-1 text-title-1 font-semibold text-skin-neutral-500">{authorName}</p>
          <p className="mt-2 text-[13.5px] leading-[150%] text-skin-neutral-400">{resolvedBio}</p>

          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
            <Link
              href={resolvedArticlesHref}
              className="text-[13.5px] font-medium text-skin-primary-500 underline"
            >
              {DEFAULT_AUTHOR_BIO.articlesLabel} {authorName} &rarr;
            </Link>
            <Link
              href={resolvedTeamHref}
              className="text-[13.5px] font-medium text-skin-primary-500 underline"
            >
              {DEFAULT_AUTHOR_BIO.teamLabel} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BlogAuthorBioCard;
