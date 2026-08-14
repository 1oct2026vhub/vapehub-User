interface BlogIndustryQuoteProps {
  quote: string;
  attribution: string;
}

const BlogIndustryQuote = ({ quote, attribution }: BlogIndustryQuoteProps) => (
  <blockquote className="blog-industry-quote border-l-4 border-skin-red-400 py-1 pl-3.5 sm:pl-4 md:pl-5">
    <p className="blog-industry-quote__text !font-opensans text-[13.5px] font-semibold leading-[150%] !text-[#083122]">
      &ldquo;{quote}&rdquo;
    </p>
    {attribution ? (
      <footer className="blog-industry-quote__attribution mt-2 text-[13px] uppercase tracking-wide !text-[#4a5e54]">
        &mdash; {attribution}
      </footer>
    ) : null}
  </blockquote>
);

export default BlogIndustryQuote;
