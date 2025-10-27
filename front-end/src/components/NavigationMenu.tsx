"use client"

import { defaultNavLinks } from "@/lib/config/category.config";
import { HeaderMegaMenu } from "@/lib/config/header.config";
import Link from "next/link";
import React, { ReactElement, useState } from "react";
import { MegaMenu } from "./MegaMenu";
import { DownArrowIcon } from "./Icons";
import { useRouter } from "next/navigation";

type Props = {
  menus: HeaderMegaMenu[];
}
 
const NavigationMenu: React.FC<Props> = ({ menus }): ReactElement => {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const handleMouseEnter = (index: number) => {
    setTimeout(() => setHoveredIndex(index), 500);
  };

  const handleMouseLeave = () => {
    setTimeout(() => setHoveredIndex(null), 500);
  };

  // Handle menu item click navigation
  const handleMenuClick = (original: string | null, entityType?: string, slug?: string) => {
    if (original && original !== '#') {
      // Handle different entity types with custom navigation
      if (entityType === 'brand' && slug) {
        router.push(`/brand/${slug}`);
      } else if (entityType === 'deal' && slug) {
        router.push(`/product-deals/${slug}`);
      } else {
        router.push(original);
      }
    }
  };

  // Filter menus based on hide_text - only show menus where hide_text is false
  const visibleMenus = menus.filter(menu => !menu.hide_text);

  const activeMenu = hoveredIndex !== null ? visibleMenus[hoveredIndex] : null;

  return (
    <div className="hidden lg:block max-w-[1520px] mx-auto">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {/* Static NEW IN menu item */}
        <li>
          <Link 
            href="/shop?is_new=true" 
            className="px-3 rounded-md text-shadow text-lg text-skin-neutral-25 uppercase font-bold font-oswald hover:text-skin-primary-300 transition-all duration-300 ease-in flex items-center gap-2"
          >
            NEW IN
          </Link>
        </li>
        
        {visibleMenus.map((item, index) => {
          // ct slug for brand and deal items
          let slug = '';
          if (item.entity_type === 'brand' || item.entity_type === 'deal') {
            slug = item.entity_data?.slug || item.original?.split('/').pop() || '';
          }

          return (
            <li 
              key={item.id}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {item.entity_type === 'brand' || item.entity_type === 'deal' ? (
                <button
                  onClick={() => handleMenuClick(item.original, item.entity_type, slug)}
                  className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-25 uppercase font-bold hover:text-skin-primary-300 font-oswald transition-all duration-300 ease-in flex items-center gap-2 bg-transparent border-none cursor-pointer`}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && <DownArrowIcon className="w-3 h-3 text-white" />}
                </button>
              ) : (
                <Link 
                  href={item.original || '#'} 
                  passHref 
                  className={`px-3 rounded-md text-shadow text-lg text-skin-neutral-25 uppercase font-bold hover:text-skin-primary-300 font-oswald transition-all duration-300 ease-in flex items-center gap-2`}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && <DownArrowIcon className="w-3 h-3 text-white" />}
                </Link>
              )}
              {activeMenu && activeMenu.children && activeMenu.children.length > 0 && (
                <MegaMenu isOpen={hoveredIndex === index} menuItems={activeMenu.children} />
              )}
            </li>
          );
        })}
        
        {/* Keep existing default nav links */}
        {defaultNavLinks.map((item, index) => (
          <li key={index}>
            <Link 
              href={item?.slug} 
              className="px-3 rounded-md text-shadow text-lg text-skin-neutral-25 uppercase font-oswald font-bold hover:text-skin-primary-300 transition-all duration-300 ease-in"
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
