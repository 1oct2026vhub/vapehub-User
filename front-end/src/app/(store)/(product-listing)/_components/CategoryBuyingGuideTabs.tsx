"use client";

import { useState } from "react";
import { CategoryBuyingGuideTab } from "@/lib/config/category-buying-guide.config";
import { BUYING_GUIDE_EMBEDDED_SECTION } from "./buying-guide-layout";

interface CategoryBuyingGuideTabsProps {
  tabs: CategoryBuyingGuideTab[];
  defaultTabId?: string;
}

const CategoryBuyingGuideTabs = ({ tabs, defaultTabId }: CategoryBuyingGuideTabsProps) => {
  const initialTabId = defaultTabId && tabs.some((tab) => tab.id === defaultTabId)
    ? defaultTabId
    : tabs[0]?.id;
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!tabs.length || !activeTab) {
    return null;
  }

  return (
    <div className={`${BUYING_GUIDE_EMBEDDED_SECTION} flex flex-col gap-4 md:gap-5`}>
      <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-lg border border-skin-neutral-100 bg-skin-white p-2 md:mx-0 md:w-full md:p-2.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-skin-white to-transparent md:hidden"
        />
        <div className="category-buying-guide-tabs-scroll">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`shrink-0 whitespace-nowrap min-h-10 rounded-lg border px-4 py-2 font-oswald text-content-1 font-semibold transition-all md:min-h-11 md:min-w-max md:flex-1 md:basis-0 md:justify-center md:px-5 md:text-center ${
                  isActive
                    ? "border-skin-primary-500 bg-skin-primary-500 text-skin-white"
                    : "border-skin-primary-500 bg-skin-white text-skin-primary-500 hover:bg-skin-neutral-25"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="product-content [&>h3]:!mt-0 [&>h3]:!mb-0">
          <h3 className="text-skin-neutral-500">{activeTab.heading}</h3>
        </div>
        <div
          className="category-buying-guide-tab-content product-content rich-text min-w-0 w-full max-w-full text-content-1 font-normal leading-relaxed"
          dangerouslySetInnerHTML={{ __html: activeTab.contentHtml }}
        />
      </div>
    </div>
  );
};

export default CategoryBuyingGuideTabs;
