'use client'

import React from 'react';
import Logo from './ui/Logo';
import { DownArrowFilledIcon, FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';
import { Accordion, AccordionItem } from '@nextui-org/react';

const Footer = () => {
  const footerSections = [
    {
      title: 'help',
      links: [
        'Contact Us',
        'Delivery Policy',
        'Returns Policy',
        'Privacy Information',
        'Terms & Conditions',
      ],
    },
    {
      title: 'quick links',
      links: [
        'About Us',
        'My Account',
        'Rewards',
        'Refer A Friend',
      ],
    },
    {
      title: 'shop',
      links: [
        'New in',
        'Disposables',
        'Nicotine Pouches',
        'Nicotine Salts',
        'Nicotine Strips',
        'Pod Kits',
        'Shortfills',
      ],
    },
  ];

  const socialMediaLinks = [
    { icon: <InstagramIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <FacebookIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <TwitterIcon className='max-sm:max-w-9' />, href: '#' },
  ];

  const itemClasses = {
    base: "w-full rounded-lg",
    title: "text-title-2 lg:text-title-1 font-semibold uppercase text-skin-white",
    trigger: '',
    indicator: "text-medium text-skin-neutral-50 data-[open=true]:rotate-180",
    content: "",
  };

  return (
    <footer className="bg-footer-gradient space-y-6 mt-auto">
      <div className="px-4 lg:px-10 pt-10 flex flex-col md:flex-row items-start justify-between gap-x-7 gap-y-6 md:gap-y-0">
        {/* Left Sections */}
        <div className="hidden md:grid grid-cols-3 gap-5 lg:gap-8 xl:gap-12">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4 text-skin-white flex flex-col">
              <h6 className="text-title-2 lg:text-title-1 font-semibold uppercase">{section.title}</h6>
              <ul className="space-y-2.5">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-content-1 lg:text-title-2 font-normal opacity-90 hover:ml-1 transition-all duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Section */}
        <div className='w-full md:hidden'>
          <Accordion variant='light' className="!px-0" itemClasses={itemClasses} selectionMode='multiple'>
            {footerSections.map((section, index) => (
              <AccordionItem key={index} aria-label={section.title} title={section.title} indicator={<DownArrowFilledIcon />}>
                <ul className="space-y-2.5">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        className="text-content-1 font-normal text-skin-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:items-end items-center max-md:mx-auto md:min-h-[270px]">
          <Logo className="max-w-56 max-h-9" />
          <div className="text-skin-white text-center md:text-right mt-2 md:mt-auto">
            <h4 className="text-title-2 font-bold">Customer Services</h4>
            <a href='mailto:customerservices@vapehub.co.uk' className="text-content-2 lg:text-content-1 font-normal whitespace-nowrap hover:underline">
              Email us: customerservices@vapehub.co.uk
            </a>
            <div className="flex items-center gap-4.5 justify-center md:justify-end mt-4 xl:mt-5.5">
              {socialMediaLinks.map((link, idx) => (
                <a key={idx} href={link.href}>
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/15 py-3 text-center">
        <p className="text-content-2 font-bold text-skin-white">
          © Copyright 2025 VapeHub - All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
