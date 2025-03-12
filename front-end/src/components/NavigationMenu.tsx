"use client"

import { Category, defaultNavLinks, SubCategory } from "@/lib/config/category.config";
import Link from "next/link";
import React, { ReactElement, useState } from "react";
import { MegaMenu } from "./MegaMenu";

type Props = {
  categories: Category[]
}
 

const NavigationMenu: React.FC<Props> = ({ categories }): ReactElement => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const handleMouseEnter = (index: number) => {
    setTimeout(() => setHoveredIndex(index), 500);
  };

  const handleMouseLeave = () => {
    setTimeout(() => setHoveredIndex(null), 500);
  };

  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {categories.slice(0, 8).map((item: Category, index: number) => (
          <li 
            key={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Link href={`/${item?.slug}`} passHref className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-300 ease-in`}>
              {item?.name}
            </Link>
            {<MegaMenu isOpen={hoveredIndex === index} />}
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
