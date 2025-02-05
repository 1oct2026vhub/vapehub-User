import { Accordion, AccordionItem, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from '@nextui-org/react'
import React from 'react'
import { CloseIcon, DownArrowIcon, FilterIcon } from './Icons'
import FilterCheckboxGroup from './FilterCheckboxGroup';

const priceOptions = [
    { label: "£0 - £10", count: 376, value: "0-10" },
    { label: "£10 - £25", count: 29, value: "10-25" },
    { label: "£25 - £50", count: 29, value: "25-50" },
    { label: "£75 - £100", count: 29, value: "75-100" },
  ];

const filterOptions = [
    { title: "Price Range", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Product Type", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Brands", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Flavors", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Bottle Size", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Nicotine Strength", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Nicotine Type", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "VG Ratio", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Vaping Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Price", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Battery Capacity", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Device Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "E-Liquid Capacity", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Function", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Pod Coil Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Pod Fill Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Power Supply", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Puff Count", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
  ];



export const ProductListingActionsWeb: React.FC = () => {
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
                        Sort By
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="new">Latest</DropdownItem>
                    <DropdownItem key="copy">Oldest</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Button
                variant="bordered"
                size="lg"
                radius="md"
                endContent={<FilterIcon />}
                className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
            >
                Hide Filter
            </Button>
        </div>
    )
}


export const ProductListingActionsMob: React.FC = () => {

    const appliedFilters = ["ELUX", "Almond (7 items)"];

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
                        size="lg"
                        radius="md"
                        endContent={<DownArrowIcon />}
                        className="border-skin-neutral-500 text-content-1 font-extrabold text-skin-neutral-500 !px-4 !py-5"
                    >
                        Sort By
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="new">Latest</DropdownItem>
                    <DropdownItem key="copy">Oldest</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Button
                variant="bordered"
                size="lg"
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
                                    <h4 className="primary-gradient-600 rounded-14 text-h5 font-bold w-fit">Filter by</h4>

                                    {/* Applied Filters Section */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {appliedFilters.map((filter, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-skin-neutral-50 border-2 border-skin-neutral-100 shadow py-1.5 px-2 rounded-lg"
                                            >
                                                <span className="text-content-2 font-bold text-skin-neutral-500">{filter}</span>
                                                <button>
                                                    <CloseIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DrawerHeader>
                            <DrawerBody className='pt-5'>
                                {/* Accordion Filters */}
                                <Accordion variant="splitted" className="!p-0" itemClasses={itemClasses} selectionMode='multiple'>
                                    {filterOptions.map(({ title, content }, index) => (
                                        <AccordionItem key={index} aria-label={title} title={title}>
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
