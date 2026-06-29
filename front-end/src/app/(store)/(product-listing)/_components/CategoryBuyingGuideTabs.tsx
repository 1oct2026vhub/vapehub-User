"use client";

import { useState } from "react";
import { CategoryBuyingGuideTab } from "@/lib/config/category-buying-guide.config";

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
    <div className="space-y-4 md:space-y-5">
      <div className="mx-auto w-full max-w-[627px] rounded-lg border border-skin-neutral-100 bg-skin-white p-2 md:p-2.5">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`min-h-10 rounded-lg border px-4 py-2 font-oswald text-content-1 font-semibold transition-all md:min-h-11 md:px-5 ${
                  isActive
                    ? "border-skin-primary-500 bg-skin-primary-500 text-skin-white shadow-card"
                    : "border-skin-primary-500 bg-skin-white text-skin-primary-500 hover:bg-skin-neutral-25"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-oswald text-title-1 font-semibold text-skin-neutral-500 md:text-h5">
          {activeTab.heading}
        </h3>
        <div
          className="category-buying-guide-tab-content product-content rich-text text-content-1 font-normal leading-relaxed text-skin-neutral-500"
          dangerouslySetInnerHTML={{ __html: activeTab.contentHtml }}
        />
      </div>
    </div>
  );
};

export default CategoryBuyingGuideTabs;
