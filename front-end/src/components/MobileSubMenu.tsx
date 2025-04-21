import Image from 'next/image';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import InputField from "./InputField";
import { SearchIcon } from "./Icons";
import { Form } from '@/components/ui/Form';
import { SubCategory } from '@/lib/config/category.config';
import Link from 'next/link';

const MobileSubMenu: React.FC = () => {

    const staticSubCategories: SubCategory[] = [
        { name: "Elux Legend 3500", slug: "shop", feature: "Hot" },
        { name: "Elf Bar", slug: "shop", feature: "New" },
        { name: "Elux", slug: "shop" },
        { name: "Hayati Pro Mini", slug: "shop", feature: "Hot" },
        { name: "Hayati Pro Max 4000", slug: "shop", feature: "New" },
        { name: "Hayati Twist 5000", slug: "shop" },
        { name: "Hayati", slug: "shop" },
        { name: "IVG Smart 5500", slug: "shop", feature: "Hot" },
        { name: "IVG", slug: "shop", feature: "New" },
        { name: "SKE Crystal Bar 600", slug: "shop", feature: "Hot" },
        { name: "SKE ", slug: "shop", feature: "New" },
        { name: "The Crystal Pro Max 4000", slug: "shop", feature: "Hot" },
        { name: "VNSN Quake 10000", slug: "shop", feature: "Hot" },
    ];


    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const sortedSubCategories = staticSubCategories.sort((a, b) => a.name.localeCompare(b.name));
    const groupedSubCategories = sortedSubCategories.reduce((acc, subCategory) => {
        const firstLetter = subCategory.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(subCategory);
        return acc;
    }, {} as Record<string, SubCategory[]>);

    return (
        <div className='flex flex-col gap-4'>
            <div className="grid grid-cols-2 gap-3.5">
                <a href="#">
                    <Image src="/images/category-banner-1.jpg" alt="category-banner-1" width={183} height={130} className="rounded-10" />
                </a>
                <a href="#">
                    <Image src="/images/category-banner-2.jpg" alt="category-banner-2" width={183} height={130} className="rounded-10" />
                </a>
                <a href="#">
                    <Image src="/images/category-banner-3.jpg" alt="category-banner-3" width={183} height={130} className="rounded-10" />
                </a>
            </div>
            <Form {...searchFromConfig}>
                <form noValidate className="w-full">
                    <InputField
                        control={searchFromConfig.control}
                        name="search"
                        type={Header_FORM_CONFIG.SEARCH.TYPE}
                        placeholder={Header_FORM_CONFIG.SEARCH.PH}
                        className="w-full"
                        classNames={{
                            input: '!text-content-2 !font-bold',
                        }}
                        startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
                    />
                </form>
            </Form>
            <div className="grid grid-cols-2 gap-y-7.5 gap-x-3.5">
                {Object.keys(groupedSubCategories).sort().map((letter, idx) => (
                    <div key={idx} className="mb-4">
                        <div className="border-b border-skin-neutral-200 mb-2">
                            <h3 className="text-title-2 font-bold text-skin-neutral-500">{letter}</h3>
                        </div>
                        <ul>
                            {groupedSubCategories[letter].map((subCategory, sIdx) => (
                                <li key={sIdx} className="flex items-center gap-2">
                                    <Link href={subCategory.slug} className="block py-2 text-skin-neutral-300 font-bold text-content-1 leading-none hover:underline">
                                        {subCategory.name}
                                    </Link>
                                    {subCategory.feature && <span className={`text-skin-white font-medium text-[8px] py-0.5 px-1.5 rounded ${subCategory.feature === "Hot" ? "bg-red-gradient" : "bg-blue-gradient"}`}>{subCategory.feature}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <ul className="space-y-2 text-skin-neutral-300 font-bold text-content-1">
                <h3 className="text-title-2 font-bold text-skin-neutral-500">
                    Multibuy Deals
                </h3>
                <li><a href="">3 for £10 Vape Disposables</a></li>
                <li><a href="">3 for £30 Vape Disposables</a></li>
                <li><a href="">3 for £27 Vape Disposables</a></li>
                <li><a href="">3 for £27 Vape Disposables</a></li>
            </ul>
        </div>
    )
}

export default MobileSubMenu;
