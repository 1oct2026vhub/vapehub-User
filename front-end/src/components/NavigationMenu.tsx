"use client"

import { defaultNavLinks } from "@/lib/config/category.config";
import { HeaderMegaMenu } from "@/lib/config/header.config";
import Link from "next/link";
import React, { ReactElement, useState } from "react";
import { MegaMenu } from "./MegaMenu";
import { DownArrowIcon } from "./Icons";

type Props = {
  menus: HeaderMegaMenu[];
}
 
const NavigationMenu: React.FC<Props> = ({ menus }): ReactElement => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const handleMouseEnter = (index: number) => {
    // setHoveredIndex(index);
    setTimeout(() => setHoveredIndex(index), 500);
  };

  const handleMouseLeave = () => {
    // setHoveredIndex(null);
    setTimeout(() => setHoveredIndex(null), 500);
  };

  const activeMenu = hoveredIndex !== null ? menus[hoveredIndex] : null;

  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {menus.slice(0, 8).map((item, index) => (
          <li 
            key={item.id}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Link href={item.original || '#'} passHref className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-300 ease-in flex items-center gap-2`}>
              {item.label}
              {item.children && item.children.length > 0 && <DownArrowIcon className="w-3 h-3" />}
            </Link>
            {activeMenu && activeMenu.children && activeMenu.children.length > 0 && (
            <MegaMenu isOpen={hoveredIndex === index} menuItems={activeMenu.children} />
            )}
          </li>
        ))}
        {
          defaultNavLinks.map((item, index) => (
            <li key={index}>
              <Link href={item?.slug} className="px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-200 ease-in">
                {item.name}
              </Link>
            </li>
          ))
        }
      </ul>
      {/* {activeMenu && activeMenu.children && activeMenu.children.length > 0 && (
        <MegaMenu isOpen={hoveredIndex !== null} menuItems={activeMenu.children} />
      )} */}
    </div>
  );
};

export default NavigationMenu;
