import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { CloseIcon } from "./Icons";

interface FilterOption {
    title: string;
    content: React.ReactNode;
}

interface FilterSidebarProps {
    appliedFilters: string[];
    onRemoveFilter: (filter: string) => void;
    filterOptions: FilterOption[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    appliedFilters,
    onRemoveFilter,
    filterOptions,
}) => {

    const itemClasses = {
        base: "w-full shadow-none !p-0",
        title: "text-content-1 font-bold",
        trigger: "rounded-lg h-11 !p-3 flex items-center border border-skin-primary-400",
        indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
        content: "text-content-1 !px-3 !pt-4 !pb-0 !space-y-6 rounded-lg border border-skin-neutral-200 shadow-md my-2",
    };

    return (
        <div className="flex flex-col gap-6 min-w-[310px] max-w-[310px] bg-skin-white p-9 border border-skin-neutral-50 rounded-14">
            <h4 className="primary-gradient-600 rounded-14 text-h5 font-bold w-fit">Filter by</h4>

            {/* Applied Filters Section */}
            <div className="flex flex-wrap gap-2 items-center">
                {appliedFilters.map((filter, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 bg-skin-neutral-50 border-2 border-skin-neutral-100 shadow py-1.5 px-2 rounded-lg"
                    >
                        <span className="text-content-2 font-bold text-skin-neutral-500">{filter}</span>
                        <button onClick={() => onRemoveFilter(filter)}>
                            <CloseIcon />
                        </button>
                    </div>
                ))}
            </div>

            {/* Accordion Filters */}
            <Accordion variant="splitted" className="!p-0" defaultExpandedKeys={["0"]} itemClasses={itemClasses}>
                {filterOptions.map(({ title, content }, index) => (
                    <AccordionItem key={index} aria-label={title} title={title}>
                        {content}
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default FilterSidebar;
