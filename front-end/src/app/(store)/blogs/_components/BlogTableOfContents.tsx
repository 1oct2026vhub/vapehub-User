"use client";

import { BlogHeading } from "@/lib/blog-content.utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface BlogTableOfContentsProps {
  headings: BlogHeading[];
  variant?: "sidebar" | "mobile";
}

const SCROLL_OFFSET = 120;

const TocList = ({
  headings,
  activeId,
  onSelect,
  scrollContainerRef,
}: {
  headings: BlogHeading[];
  activeId: string;
  onSelect: (id: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  const updateIndicator = useCallback(() => {
    const wrapper = wrapperRef.current;
    const activeEl = itemRefs.current.get(activeId);
    if (!wrapper || !activeEl) return;

    setIndicator({
      top: activeEl.getBoundingClientRect().top - wrapper.getBoundingClientRect().top,
      height: activeEl.offsetHeight,
    });
  }, [activeId]);

  useEffect(() => {
    updateIndicator();

    const scrollEl = scrollContainerRef?.current;
    window.addEventListener("resize", updateIndicator);
    window.addEventListener("scroll", updateIndicator, { passive: true });
    scrollEl?.addEventListener("scroll", updateIndicator, { passive: true });

    return () => {
      window.removeEventListener("resize", updateIndicator);
      window.removeEventListener("scroll", updateIndicator);
      scrollEl?.removeEventListener("scroll", updateIndicator);
    };
  }, [updateIndicator, headings, scrollContainerRef]);

  useEffect(() => {
    if (!scrollContainerRef?.current) return;

    const activeEl = itemRefs.current.get(activeId);
    if (!activeEl) return;

    activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId, scrollContainerRef]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onSelect(id);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-skin-neutral-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 w-1 -translate-x-[1.5px] rounded-full bg-skin-primary-500 transition-[top,height] duration-200 ease-out"
        style={{ top: indicator.top, height: indicator.height }}
        aria-hidden
      />
      <ol ref={listRef} className="!mt-0 !list-none !pl-0 flex flex-col gap-3">
        {headings.map(({ id, text, index }) => {
          const isActive = activeId === id;
          const number = String(index + 1).padStart(2, "0");

          return (
            <li
              key={id}
              ref={(el) => {
                if (el) itemRefs.current.set(id, el);
                else itemRefs.current.delete(id);
              }}
            >
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                className={`flex items-start gap-2 pl-4 text-content-1 leading-snug transition-colors ${
                  isActive
                    ? "font-semibold text-skin-primary-500"
                    : "font-normal text-skin-neutral-300 hover:text-skin-neutral-400"
                }`}
              >
                <span className="shrink-0 tabular-nums">{number}</span>
                <span className="min-w-0 break-words">{text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const BlogTableOfContents = ({ headings, variant = "sidebar" }: BlogTableOfContentsProps) => {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headings.length) return;

    const resolveActiveHeading = () => {
      let current = headings[0].id;

      for (const { id } of headings) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= SCROLL_OFFSET) {
          current = id;
        }
      }

      setActiveId(current);
    };

    resolveActiveHeading();
    window.addEventListener("scroll", resolveActiveHeading, { passive: true });
    return () => window.removeEventListener("scroll", resolveActiveHeading);
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
      <p className="shrink-0 text-content-2 font-semibold uppercase tracking-wide text-skin-neutral-300">
        On this page
      </p>
      <div className="blog-post-toc-scroll-clip max-h-[calc(100vh-9rem)] overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="blog-post-toc-scroll max-h-[calc(100vh-9rem)] overflow-y-auto overscroll-y-contain"
          tabIndex={-1}
        >
          <TocList
            headings={headings}
            activeId={activeId}
            onSelect={setActiveId}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
    </nav>
  );
};

export default BlogTableOfContents;
