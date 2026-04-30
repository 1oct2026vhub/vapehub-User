import React from "react";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { CloseIcon } from "./Icons";
import { AppliedFilters } from "@/lib/config/product.config";

interface FilterOption {
    title: string;
    content: React.ReactNode;
}

interface FilterSidebarProps {
    appliedFilters: AppliedFilters[];
    onRemoveFilter: (attributeId: number, type: string) => void;
    onClearAllFilters: () => void;
    filterOptions: FilterOption[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    appliedFilters,
    onRemoveFilter,
    filterOptions,
    onClearAllFilters
}) => {
    const itemClasses = {
        base: "w-full shadow-none !p-0",
        title: "!text-content-2 xl:!text-content-1 capitalize text-nowrap text-skin-neutral-500 !font-opensans",
        trigger: "rounded-lg h-11 !p-3 flex items-center border border-skin-primary-400",
        indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
        content: "text-content-1 !px-3 !pt-4 !pb-0 !space-y-6 rounded-lg border border-skin-neutral-200 shadow-md my-2",
    };

    return (
        <div className="hidden md:flex flex-col gap-6 xl:min-w-[310px] max-w-[310px] bg-skin-white p-4 xl:p-9 border border-skin-neutral-50 rounded-14">
            <div className="flex items-center justify-between">
                <div className="!font-oswald primary-gradient-600 text-h5 font-bold w-fit">Filter by</div>
                {appliedFilters.length > 0 && (
                    <Button onPress={onClearAllFilters} color="default" variant="bordered" className="text-skin-neutral-500 text-content-2 font-bold">Clear All</Button>
                )}
            </div>

            {/* Applied Filters Section */}
            {appliedFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    {appliedFilters.map((filter, index) => (
                        <div
                            key={`${filter.attributeId}-${index}`}
                            className="flex items-center gap-2 bg-skin-neutral-50 border-2 border-skin-neutral-100 shadow py-1.5 px-2 rounded-lg capitalize"
                        >
                            <span className="text-content-2 font-bold text-skin-neutral-500">
                                {filter.attribute} ({filter.count})
                            </span>
                            <button 
                                onClick={() => onRemoveFilter(filter.attributeId, filter.type)}
                                className="hover:opacity-70 transition-opacity"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Accordion Filters */}
            <Accordion 
                variant="splitted" 
                className="!p-0" 
                defaultExpandedKeys={["0"]} 
                itemClasses={itemClasses} 
                selectionMode="multiple"
            >
                {filterOptions.map(({ title, content }, index) => (
                    <AccordionItem 
                        key={index} 
                        aria-label={title} 
                        title={title}
                    >
                        {content}
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default FilterSidebar;
