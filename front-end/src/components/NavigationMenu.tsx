import { Category, defaultNavLinks, SubCategory } from "@/lib/config/category.config";
import Link from "next/link";
import React, { ReactElement } from "react";

type Props = {
  categories: Category[]
}
const NavigationMenu:React.FC<Props> = ({ categories }): ReactElement => {
 
  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center w-full">
        {categories.slice(0, 8).map((item: Category, index: number) => (
          <li key={index}>
            <Link href={`/${item?.slug}`} passHref className="px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-200 ease-in">
              {item?.name}
            </Link>
             
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
