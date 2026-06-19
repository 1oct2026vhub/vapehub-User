interface BlogIndustryQuoteProps {
  quote: string;
  attribution: string;
}

const BlogIndustryQuote = ({ quote, attribution }: BlogIndustryQuoteProps) => (
  <blockquote className="blog-industry-quote border-l-4 border-skin-red-400 py-1 pl-3.5 sm:pl-4 md:pl-5">
    <p className="!font-opensans text-[13.5px] font-semibold leading-[150%] text-skin-primary-500">
      &ldquo;{quote}&rdquo;
    </p>
    <footer className="mt-2 text-[13px] uppercase tracking-wide text-skin-neutral-300">
      &mdash; {attribution}
    </footer>
  </blockquote>
);

export default BlogIndustryQuote;
