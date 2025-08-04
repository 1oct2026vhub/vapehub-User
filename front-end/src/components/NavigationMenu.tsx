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
    setTimeout(() => setHoveredIndex(index), 500);
  };

  const handleMouseLeave = () => {
    setTimeout(() => setHoveredIndex(null), 500);
  };

  // Filter menus based on hide_text - only show menus where hide_text is false
  const visibleMenus = menus.filter(menu => !menu.hide_text).slice(0, 8);

  const activeMenu = hoveredIndex !== null ? visibleMenus[hoveredIndex] : null;

  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {visibleMenus.map((item, index) => (
          <li 
            key={item.id}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href={item.original || '#'} 
              passHref 
              className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-300 ease-in flex items-center gap-2`}
            >
              {item.label}
              {item.children && item.children.length > 0 && <DownArrowIcon className="w-3 h-3" />}
            </Link>
            {activeMenu && activeMenu.children && activeMenu.children.length > 0 && (
              <MegaMenu isOpen={hoveredIndex === index} menuItems={activeMenu.children} />
            )}
          </li>
        ))}
        
        {/* Keep existing default nav links */}
        {defaultNavLinks.map((item, index) => (
          <li key={index}>
            <Link 
              href={item?.slug} 
              className="px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-200 ease-in"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;
