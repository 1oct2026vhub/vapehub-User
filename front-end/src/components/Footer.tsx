import React from 'react';
import Logo from './ui/Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';
import Link from 'next/link';
import { getFooterMenu } from '@/lib/server.actions';
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import FooterMobile from './FooterMobile';
import { FooterMenu } from '@/lib/config/header.config';

const Footer = async (): AsyncReactElement => {
  const footerMenuResponse = await getFooterMenu();   

  if (footerMenuResponse.status !== ServerActionStatus.SUCCESS) {
    return <div>{footerMenuResponse.message}</div>;
  }

  const footerMenu: FooterMenu[] = footerMenuResponse.data;

  // Sort footer menu items by order and filter active items
  const sortedFooterMenu = footerMenu
    .filter(menu => menu.is_active)
    .sort((a, b) => a.order - b.order)
    .map(menu => ({
      ...menu,
      links: menu.links
        .filter(link => link.is_active)
        .sort((a, b) => a.order - b.order)
    }))
    .filter(menu => menu.links.length > 0); // Only keep sections with active links

  const socialMediaLinks = [
    { icon: <InstagramIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <FacebookIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <TwitterIcon className='max-sm:max-w-9' />, href: '#' },
  ];

  return (
    <footer className="bg-footer-gradient space-y-6 mt-auto">
      <div className="px-4 lg:px-10 pt-10 flex flex-col md:flex-row items-start justify-between gap-x-7 gap-y-6 md:gap-y-0">
        {/* Left Sections */}
        <div className="hidden md:grid grid-cols-4 gap-5 lg:gap-8 xl:gap-12">
          {sortedFooterMenu.map((section) => (
            <div key={section.id} className="space-y-4 text-skin-white flex flex-col">
              <h6 className="text-title-2 lg:text-title-1 font-semibold uppercase">{section.title}</h6>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-content-1 lg:text-title-2 font-normal opacity-90 hover:opacity-100 hover:font-semibold transition-all duration-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Section */}
        <div className='w-full md:hidden'>
          <FooterMobile footerMenu={sortedFooterMenu} />
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:items-end items-center max-md:mx-auto md:min-h-[270px]">
          <Logo className="max-w-56 max-h-9" />
          <div className="text-skin-white text-center md:text-right mt-2 md:mt-auto">
            <h4 className="text-title-2 font-bold">Customer Services</h4>
            <div className='text-content-2 lg:text-content-1 font-normal'>
              Email us: 
              <a href='mailto:customerservices@vapehub.co.uk' className="whitespace-nowrap hover:underline ml-1">
                customerservices@vapehub.co.uk
              </a>
            </div>
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
