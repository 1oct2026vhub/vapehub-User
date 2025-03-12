"use client"

import { Category, defaultNavLinks, SubCategory } from "@/lib/config/category.config";
import Link from "next/link";
import React, { ReactElement, useState } from "react";
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import InputField from "./InputField";
import { SearchIcon } from "./Icons";
import { Form } from '@/components/ui/Form';
import Image from "next/image";

type Props = {
  categories: Category[]
}

const MegaMenu: React.FC = () => {
  const staticSubCategories: SubCategory[] = [
    { name: "Elux Legend 3500", slug: "#", feature: "Hot" },
    { name: "Elf Bar", slug: "#", feature: "New" },
    { name: "Elux", slug: "#" },
    { name: "Hayati Pro Mini", slug: "#", feature: "Hot" },
    { name: "Hayati Pro Max 4000", slug: "#", feature: "New" },
    { name: "Hayati Twist 5000", slug: "#" },
    { name: "Hayati", slug: "#" },
    { name: "IVG Smart 5500", slug: "#", feature: "Hot" },
    { name: "IVG", slug: "#", feature: "New" },
    { name: "SKE Crystal Bar 600", slug: "#", feature: "Hot" },
    { name: "SKE ", slug: "#", feature: "New" },
    { name: "The Crystal Pro Max 4000", slug: "#", feature: "Hot" },
    { name: "VNSN Quake 10000", slug: "#", feature: "Hot" },
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
    <div className="absolute left-0 -bottom-[448px] w-full border-t border-skin-neutral-200 shadow-card bg-skin-base z-20 px-12.5 py-9 transition-all duration-300 min-h-[428px] max-h-[500px] overflow-y-auto flex items-start">
      <div className="w-[50%] 2xl:w-[60%] space-y-6 pr-7 border-r border-skin-neutral-200">
        <Form {...searchFromConfig}>
          <form noValidate className="w-full">
            <InputField
              control={searchFromConfig.control}
              name="search"
              type={Header_FORM_CONFIG.SEARCH.TYPE}
              placeholder={Header_FORM_CONFIG.SEARCH.PH}
              className="w-full"
              classNames={{
                input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
              }}
              startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
            />
          </form>
        </Form>
        <div className="grid grid-cols-3 gap-9">
          {Object.keys(groupedSubCategories).sort().map(letter => (
            <div key={letter} className="mb-4">
              <div className="border-b border-skin-neutral-200 mb-2">
                <h3 className="text-title-2 font-bold text-skin-neutral-500">{letter}</h3>
              </div>
              <ul>
                {groupedSubCategories[letter].map(subCategory => (
                  <li key={subCategory.slug} className="flex items-center gap-2">
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
      </div>
      <div className="space-y-8 pl-7">
        <div className="grid grid-cols-3 gap-3.5">
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
    </div>
  );
};

const NavigationMenu: React.FC<Props> = ({ categories }): ReactElement => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const handleMouseEnter = (category: Category) => {
    setActiveCategory(category);
  };

  const handleMouseLeave = () => {
    setTimeout(() => setActiveCategory(null), 10000); // Add a delay before hiding
  };

  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {categories.slice(0, 8).map((item: Category, index: number) => (
          <li key={index} onMouseEnter={() => handleMouseEnter(item)} onMouseLeave={handleMouseLeave}>
            <Link href={`/${item?.slug}`} passHref className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-300 ease-in`}>
              {item?.name}
            </Link>
            {activeCategory === item && <MegaMenu />}
          </li>
        ))}
        {
          defaultNavLinks.map((item: SubCategory, index: number) => (
            <li key={index}>
              <Link href={item?.slug} className="px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-200 ease-in">
                {item.name}
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  );
};

export default NavigationMenu;
