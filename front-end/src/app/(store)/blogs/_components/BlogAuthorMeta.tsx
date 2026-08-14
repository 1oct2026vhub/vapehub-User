import Image from "next/image";
import { Author } from "@/lib/config/blog.config";

interface BlogAuthorMetaProps {
  author: Author;
  publishedAt: string;
  updatedAt: string;
}

const formatBlogDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const BlogAuthorMeta = ({ author, publishedAt, updatedAt }: BlogAuthorMetaProps) => {
  const authorName =
    [author.first_name, author.last_name].filter(Boolean).join(" ").trim() || "VapeHub";
  const authorRole = author.role?.trim() || "VapeHub product team";
  const initials = authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = author.avatar_url?.trim();

  return (
    <div className="flex flex-col gap-4 border-y border-skin-neutral-100 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
      <div className="flex min-w-0 items-start gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={authorName}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-skin-neutral-100 text-content-1 font-semibold text-skin-neutral-400"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="!font-opensans text-title-2 font-semibold primary-gradient-600">            {authorName}
          </p>
          <p className="text-content-1 text-skin-neutral-300">{authorRole}</p>
        </div>
      </div>
      <div className="shrink-0 text-content-1 text-skin-neutral-300 sm:text-right">
        <p>Published {formatBlogDate(publishedAt)}</p>
        <p>Last updated {formatBlogDate(updatedAt)}</p>
      </div>
    </div>
  );
};

export default BlogAuthorMeta;
