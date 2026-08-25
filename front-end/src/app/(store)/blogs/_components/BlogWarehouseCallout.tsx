interface BlogWarehouseCalloutProps {
  label?: string;
  title: string;
  bodyHtml: string;
}

const BlogWarehouseCallout = ({
  label = "FROM OUR WAREHOUSE",
  title,
  bodyHtml,
}: BlogWarehouseCalloutProps) => (
  <aside
    className="blog-warehouse-callout flex gap-3 rounded-r-lg border-l-4 border-skin-primary-500 bg-[#f0f9f9] p-3.5 sm:gap-4 sm:p-4 md:p-5"
    aria-label={label}
  >
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-skin-primary-500 md:h-9 md:w-9"
    >
      <span className="text-base font-bold leading-none text-skin-primary-500">!</span>
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wide text-skin-primary-500">
        {label}
      </p>
      <p className="mt-1 text-content-1 font-semibold leading-snug text-skin-primary-500 sm:text-title-2">
        {title}
      </p>
      {bodyHtml ? (
        <div
          className="blog-warehouse-callout-body rich-text mt-2 text-[13.5px] leading-[150%] text-skin-primary-500"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : null}
    </div>
  </aside>
);

export default BlogWarehouseCallout;
