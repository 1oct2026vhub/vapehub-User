"use client"
import React from 'react';
import { DownArrowFilledIcon } from './Icons';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Category } from '@/lib/config/category.config';
import Link from 'next/link';
import { FooterConfig } from '@/lib/config/global.config';

const itemClasses = {
    base: "w-full rounded-lg",
    title: "text-title-2 lg:text-title-1 font-semibold uppercase text-skin-white",
    trigger: '',
    indicator: "text-medium text-skin-neutral-50 data-[open=true]:rotate-180",
    content: "",
};

 type Props = {
    footerSections: FooterConfig[];
    categories: Category[]
 }

const FooterMobile: React.FC<Props> = ({footerSections, categories}) => {
    return (
        <>
        <Accordion variant='light' className="!px-0" itemClasses={itemClasses} selectionMode='multiple'>
            {/* Help Section */}
          <AccordionItem title="Help" indicator={<DownArrowFilledIcon />}>
            <ul className="space-y-2.5">
              {footerSections[0].links.map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-content-1 font-normal text-skin-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionItem>

          {/* Quick Links Section */}
          <AccordionItem title="Quick Links" indicator={<DownArrowFilledIcon />}>
            <ul className="space-y-2.5">
              {footerSections[1].links.map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-content-1 font-normal text-skin-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionItem>
          
            <AccordionItem aria-label="shop" title="shop" indicator={<DownArrowFilledIcon />}>
              <ul className="space-y-2.5">
                {categories.length > 0 && categories.slice(0, 8).map((category, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/${category.slug}`}
                      passHref
                      className="text-content-1 font-normal text-skin-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

              </ul>
            </AccordionItem>


          </Accordion>
          </>
    );
};
 
export default FooterMobile;