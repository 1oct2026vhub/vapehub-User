import NoImage from "@/components/NoImage";
import {
  CategoryBuyingGuideData,
  CATEGORY_BUYING_GUIDE_MEDIA_HEIGHT,
  CATEGORY_BUYING_GUIDE_MEDIA_WIDTH,
  DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
} from "@/lib/config/category-buying-guide.config";
import CategoryBuyingGuideTabs from "./CategoryBuyingGuideTabs";
import SectionHeading from "@/components/ui/SectionHeading";

interface CategoryBuyingGuideProps extends CategoryBuyingGuideData {
  embedded?: boolean;
  hideHeader?: boolean;
}

const BuyingGuideHighlight = ({ label }: { label: string }) => (
  <div className="flex min-h-[52px] items-stretch overflow-hidden rounded-lg border border-skin-neutral-100 bg-skin-white">
    <div className="w-1 shrink-0 bg-skin-primary-500 sm:w-1.5" aria-hidden />
    <p className="flex flex-1 items-center px-3.5 py-3 font-oswald text-content-1 font-semibold text-skin-neutral-500 sm:px-4 sm:text-title-2">
      {label}
    </p>
  </div>
);

const CategoryBuyingGuide = ({
  label = DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
  title,
  highlights,
  contentHtml,
  imageUrl,
  imageAlt,
  tabs,
  defaultTabId,
  embedded = false,
  hideHeader = false,
}: CategoryBuyingGuideProps) => (
  <section
    className={
      embedded
        ? "w-full space-y-5 md:space-y-6"
        : "w-full space-y-5 rounded-2xl bg-skin-white p-5 shadow-card md:space-y-6 md:p-7 xl:p-10"
    }
    aria-label={label}
  >
    {!hideHeader ? (
      <div className="space-y-1.5">
        <p className="text-content-2 font-semibold text-skin-neutral-300">{label}</p>
        <SectionHeading title={title} className="w-fit" />
      </div>
    ) : null}

    {highlights.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <BuyingGuideHighlight key={highlight} label={highlight} />
        ))}
      </div>
    )}

    {contentHtml ? (
      <div
        className="category-buying-guide-content product-content rich-text  w-full max-w-[903px] text-content-1 font-normal leading-relaxed text-skin-neutral-500"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    ) : null}

    {imageUrl ? (
      <div className="w-full max-w-[903px] overflow-hidden rounded-xl">
        <NoImage
          src={imageUrl}
          alt={imageAlt || title}
          width={CATEGORY_BUYING_GUIDE_MEDIA_WIDTH}
          height={CATEGORY_BUYING_GUIDE_MEDIA_HEIGHT}
          className="aspect-[903/355.38] w-full object-cover"
        />
      </div>
    ) : null}

    {tabs?.length ? (
      <CategoryBuyingGuideTabs tabs={tabs} defaultTabId={defaultTabId} />
    ) : null}
  </section>
);

export default CategoryBuyingGuide;
