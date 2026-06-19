"use client";

import { BlogHeading } from "@/lib/blog-content.utils";
import { useEffect, useState } from "react";

interface BlogTableOfContentsProps {
  headings: BlogHeading[];
  variant?: "sidebar" | "mobile";
}

const TocList = ({
  headings,
  activeId,
  onSelect,
}: {
  headings: BlogHeading[];
  activeId: string;
  onSelect: (id: string) => void;
}) => (
  <ol className="!list-none !mt-0 !pl-0 flex flex-col gap-3">
    {headings.map(({ id, text, index }) => {
      const isActive = activeId === id;
      const number = String(index + 1).padStart(2, "0");

      return (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={() => onSelect(id)}
            className={`flex items-start gap-2 text-content-1 leading-snug transition-colors ${
              isActive
                ? "border-l-2 border-skin-primary-500 pl-3 font-semibold text-skin-neutral-500"
                : "border-l-2 border-transparent pl-3 text-skin-neutral-300 hover:text-skin-neutral-400"
            }`}
          >
            <span className="shrink-0 tabular-nums">{number}</span>
            <span className="min-w-0 break-words">{text}</span>
          </a>
        </li>
      );
    })}
  </ol>
);

const BlogTableOfContents = ({ headings, variant = "sidebar" }: BlogTableOfContentsProps) => {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  if (variant === "mobile") {
    return (
      <details className="group rounded-xl border border-skin-neutral-100 bg-skin-neutral-25 open:pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-content-2 font-semibold uppercase tracking-wide text-skin-neutral-300 [&::-webkit-details-marker]:hidden">
          <span>On this page</span>
          <span
            aria-hidden
            className="text-skin-neutral-300 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <nav aria-label="On this page" className="border-t border-skin-neutral-100 px-4 pt-4">
          <TocList headings={headings} activeId={activeId} onSelect={setActiveId} />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="flex flex-col gap-4 pt-0">
      <p className="text-content-2 font-semibold uppercase tracking-wide text-skin-neutral-300">
        On this page
      </p>
      <TocList headings={headings} activeId={activeId} onSelect={setActiveId} />
    </nav>
  );
};

export default BlogTableOfContents;
