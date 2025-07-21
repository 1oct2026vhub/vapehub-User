"use client"
import React from 'react';
import { DownArrowFilledIcon } from './Icons';
import { Accordion, AccordionItem } from '@nextui-org/react';
import Link from 'next/link';
import { FooterMenu } from '@/lib/config/header.config';

const itemClasses = {
    base: "w-full rounded-lg",
    title: "text-title-2 lg:text-title-1 font-semibold uppercase text-skin-white",
    trigger: '',
    indicator: "text-medium text-skin-neutral-50 data-[open=true]:rotate-180",
    content: "",
};

type Props = {
    footerMenu: FooterMenu[];
    socialMediaLinks: { icon: React.ReactNode; href: string }[];
}

const FooterMobile: React.FC<Props> = ({ footerMenu, socialMediaLinks }) => {
    const items = footerMenu.map(section => ({
        key: section.id,
        title: section.title,
        content: (
            <ul className="space-y-2.5">
                {section.links.map((link) => (
                    <li key={link.id}>
                        <Link
                            href={link.url}
                            className="text-content-1 font-normal text-skin-white"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        )
    }));

    return (
        <>
            <Accordion 
                variant='light' 
                className="!px-0" 
                itemClasses={itemClasses} 
                selectionMode='multiple'
            >
                {items.map((item) => (
                    <AccordionItem
                        key={item.key}
                        title={item.title}
                        indicator={<DownArrowFilledIcon />}
                    >
                        {item.content}
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="flex items-center gap-4.5 justify-center md:justify-end mt-4 xl:mt-5.5">
                {socialMediaLinks.map((link, idx) => (
                    <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.icon}
                    </a>
                ))}
            </div>
        </>
    );
};
 
export default FooterMobile;