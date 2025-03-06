import ViewAllLink from '@/components/ui/ViewAllLink'
import { Checkbox, Select, SelectItem } from '@nextui-org/react';
import React, { useState } from 'react'
import { isLessThanOneMonth } from "@/lib/config/app.config";
import ProductCard from '@/components/ProductCard';
import Slider, { Settings } from 'react-slick';

const products = [
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "vg-pro-6000",
        price: "12.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-1.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "elf-bar-5000",
        price: "10.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-2.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "vg-pro-6000",
        price: "12.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-3.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "elf-bar-5000",
        price: "10.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-4.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "vg-pro-6000",
        price: "12.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-1.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "elf-bar-5000",
        price: "10.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-2.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "vg-pro-6000",
        price: "12.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-3.png'
    },
    {
        name: "VG Pro 6000 Prefilled Pods",
        slug: "elf-bar-5000",
        price: "10.99",
        puff_count: 15000,
        Flavors: 20,
        createdAt: "2025-02-10",
        imageSrc: '/images/nicsalts-4.png'
    },
];


const NicSalts: React.FC = () => {

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const priceOptions = [
        { label: "3 for £10", count: 6, value: "3 for £10" },
        { label: "2 for £25", count: 9, value: "2 for £25" },
        { label: "3 for £25", count: 9, value: "3 for £25" },
        { label: "3 for £27", count: 9, value: "3 for £27" },
        { label: "3 for £30", count: 9, value: "3 for £30" },
        { label: "3 for £35", count: 9, value: "3 for £35" },
    ];

    const handleCheckboxChange = (value: string) => {
        setSelectedValues((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const settings: Settings = {
        dots: true,
        infinite: products.length > 4,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        lazyLoad: "progressive",
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: products.length > 3,
                    dots: true,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: products.length > 2,
                    dots: true,
                },
            },
            {
                breakpoint: 390,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: products.length > 1,
                    dots: true,
                },
            },
        ],
    };

    return (
        <div className='space-y-4 mt-7 md:mt-12.5'>
            <div className="flex items-center justify-between">
                <h2 className='text-h5 md:text-h4 font-bold text-skin-neutral-500'>Nic Salts</h2>
                <ViewAllLink href='#' />
            </div>
            <Select
                size="sm"
                className="w-full"
                variant="bordered"
                label="Deals"
                classNames={{
                    label: "!text-content-1 !text-skin-neutral-500 font-bold",
                    trigger: "shadow-base border border-skin-primary-400 max-w-44",
                    listboxWrapper: "max-h-[400px]",
                }}
                selectionMode="multiple" // Allows multiple selections
                selectedKeys={selectedValues} // Sync with state
                onSelectionChange={(keys) => setSelectedValues(Array.from(keys) as string[])}
            >
                {priceOptions.map(({ label, count, value }) => (
                    <SelectItem key={value} textValue={value}>
                        <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()} // Prevents Select from closing
                        >
                            <Checkbox
                                size="md"
                                value={value}
                                isSelected={selectedValues.includes(value)}
                                onChange={() => handleCheckboxChange(value)}
                                classNames={{
                                    base: "",
                                    wrapper: "after:bg-primary-gradient-100 after:rounded",
                                    label: "!text-content-2 text-nowrap",
                                }}
                            />
                            <span className="text-skin-neutral-400 font-medium text-nowrap">{label}</span>
                            <span className="text-skin-neutral-500 font-normal">({count})</span>
                        </div>
                    </SelectItem>
                ))}
            </Select>
            <div className="slider-container section-slider products-slider">
                <Slider {...settings}>
                    {products.map((product, index) => (
                        <div key={index} className="px-1 md:px-2 xl:px-5 py-4">
                            <ProductCard
                                title={product.name}
                                imageSrc={product.imageSrc}
                                price={product.price}
                                buttonText={"3 for £30"}
                                reviews={10}
                                flavors={product.Flavors}
                                link={`/${product.slug}`}
                                totalPuffs={product?.puff_count ? `${product?.puff_count} Puffs`: ""}
                                isNew={isLessThanOneMonth(product.createdAt) ? "New" : ""}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    )
}

export default NicSalts
