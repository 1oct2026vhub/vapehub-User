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
}

interface AccordionItem {
    key: string | number;
    title: string;
    content: React.ReactNode;
}

const FooterMobile: React.FC<Props> = ({ footerMenu }) => {
    const items: AccordionItem[] = footerMenu.map(section => ({
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
    );
};
 
export default FooterMobile;