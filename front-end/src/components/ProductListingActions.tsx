import { Accordion, AccordionItem, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection, useDisclosure } from '@nextui-org/react'
import React from 'react'
import { CloseIcon, DownArrowIcon, FilterIcon } from './Icons' 
import { sortByOptions } from '@/lib/config/filter.config';
import { AppliedFilters } from '@/lib/config/product.config';

interface FilterOption {
    title: string;
    content: React.ReactNode;
}

type ProductListingActionsMobProps = {
    onSortChange: (value: string) => void;
    initialValue?: string;
    isFilterVisible?: boolean;
    onFilterToggle?: () => void;
    appliedFilters: AppliedFilters[];
    onRemoveFilter: (attributeId: number, type: string) => void;
    filterOptions: FilterOption[];
    onClearAllFilters: () => void;
}

type ProductListingActionsWebProps = {
    onSortChange: (value: string) => void;
    initialValue?: string;
    isFilterVisible?: boolean;
    onFilterToggle?: () => void;
     
}

export const ProductListingActionsWeb: React.FC<ProductListingActionsWebProps> = ({
    onSortChange,
    initialValue = "Sort By",
    isFilterVisible = true,
    onFilterToggle
}) => {
    // Normalize initialValue to a valid option value, defaulting to "popularity"
    const getValidInitialValue = (value: string | undefined): string => {
        if (!value || value === "Sort By") {
            return "popularity"; // Default to Popularity
        }
        // Check if the value exists in sortByOptions
        const isValid = sortByOptions.some(option => option.value === value);
        return isValid ? value : "popularity"; // Default to "popularity" if invalid
    };

    const validInitialValue = getValidInitialValue(initialValue);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([validInitialValue]));

    // Update selectedKeys when initialValue changes (e.g., from URL params)
    React.useEffect(() => {
        const newValidValue = getValidInitialValue(initialValue);
        setSelectedKeys(new Set([newValidValue]));
    }, [initialValue]);

    const onChangeSortChange = (keys: Selection) => {
        const selected = Array.from(keys)[0];
        const selectedValue = sortByOptions.find(option => option.value === selected.toString())?.value as string;
        onSortChange(selectedValue.toString());
        setSelectedKeys(keys);

    }
    return (
        <div className="bg-skin-white border border-skin-base rounded-xl hidden md:flex items-center gap-3 py-3 px-3.5 ml-auto w-fit">
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="bordered"
                        size="lg"
                        radius="md"
                        endContent={<DownArrowIcon />}
                        className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
                    >
                        {sortByOptions.find(option => option.value === Array.from(selectedKeys)[0])?.label || "Popularity"}
                    </Button>
                </DropdownTrigger>

                <DropdownMenu aria-label="Static Actions"
                    selectedKeys={selectedKeys}
                    selectionMode="single"
                    disallowEmptySelection
                    variant="flat"
                    onSelectionChange={onChangeSortChange}>
                    {sortByOptions.map((option) => (
                        <DropdownItem key={option.value}>{option.label}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
            <Button
                variant="bordered"
                size="lg"
                radius="md"
                endContent={<FilterIcon />}
                onPress={onFilterToggle}
                className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
            >
                {isFilterVisible ? 'Hide Filter' : 'Show Filter'}
            </Button>
        </div>
    )
}


export const ProductListingActionsMob: React.FC<ProductListingActionsMobProps> = ({
    onSortChange,
    initialValue = "Sort By",
    appliedFilters,
    onRemoveFilter,
    filterOptions,
    onClearAllFilters

}) => {

   
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    
    // Normalize initialValue to a valid option value, defaulting to "popularity"
    const getValidInitialValue = (value: string | undefined): string => {
        if (!value || value === "Sort By") {
            return "popularity"; // Default to Popularity
        }
        // Check if the value exists in sortByOptions
        const isValid = sortByOptions.some(option => option.value === value);
        return isValid ? value : "popularity"; // Default to "popularity" if invalid
    };

    const validInitialValue = getValidInitialValue(initialValue);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([validInitialValue]));

    // Update selectedKeys when initialValue changes (e.g., from URL params)
    React.useEffect(() => {
        const newValidValue = getValidInitialValue(initialValue);
        setSelectedKeys(new Set([newValidValue]));
    }, [initialValue]);

    const onChangeSortChange = (keys: Selection) => {
        const selected = Array.from(keys)[0];
        const selectedValue = sortByOptions.find(option => option.value === selected.toString())?.value as string;
        onSortChange(selectedValue.toString());
        setSelectedKeys(keys);

    }

    const itemClasses = {
        base: "w-full shadow-none !p-0",
        title: "!text-content-2 xl:!text-content-1 text-nowrap font-bold",
        trigger: "rounded-lg h-11 !p-3 flex items-center border border-skin-primary-400",
        indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
        content: "text-content-1 !px-3 !pt-4 !pb-0 !space-y-6 rounded-lg border border-skin-neutral-200 shadow-md my-2",
    };

    return (
        <div className="flex items-center gap-4.5 ml-auto w-fit md:hidden">
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="bordered"
                        size="md"
                        radius="md"
                        endContent={<DownArrowIcon />}
                        className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
                    >
                        {sortByOptions.find(option => option.value === Array.from(selectedKeys)[0])?.label || "Popularity"}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions"
                    selectedKeys={selectedKeys}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={onChangeSortChange}>
                    {sortByOptions.map((option) => (
                        <DropdownItem key={option.value}>{option.label}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
            <Button
                variant="bordered"
                size="md"
                radius="md"
                endContent={<FilterIcon />}
                onPress={onOpen}
                className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
            >
                Filter
            </Button>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement='bottom' className='filter-drawer max-h-[90vh]'>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-3 pt-5 border-b border-skin-neutral-100">
                                <div className='w-[86px] h-[5px] bg-[#9CA0A7] mx-auto rounded-10' />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="!font-oswald primary-gradient-600 rounded-14 text-h5 font-bold w-fit p-1">Filter by</p>
                                        {appliedFilters.length > 0 && (
                                            <Button onPress={onClearAllFilters} color="default" variant="bordered" className="text-skin-neutral-500 text-content-2 font-bold">Clear All</Button>
                                        )}
                                    </div>

                                    {/* Applied Filters Section */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {appliedFilters.length > 0 && (
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {appliedFilters.map((filter, index) => (
                                                    <div
                                                        key={`${filter.attributeId}-${index}`}
                                                        className="flex items-center gap-2 bg-skin-neutral-50 border-2 border-skin-neutral-100 shadow py-1.5 px-2 rounded-lg"
                                                    >
                                                        <span className="text-content-2 font-bold text-skin-neutral-500 capitalize">
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
                                    </div>
                                </div>
                            </DrawerHeader>
                            <DrawerBody className='pt-5'>
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
                                            HeadingComponent="div"
                                            title={title}
                                        >
                                            {content}
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </DrawerBody>
                            <DrawerFooter>
                                <Button color="danger" variant="bordered" onPress={onClose} radius='sm' size='lg' className='border border-skin-neutral-500 rounded-10 w-full !text-title-2 text-skin-neutral-500 !font-bold'>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose} radius='sm' size='lg' className='btn primary-btn w-full !text-title-2 !rounded-10 !font-bold'>
                                    Apply
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    )
}
