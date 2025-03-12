import React from 'react';
import Logo from './ui/Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';
import Link from 'next/link';
import { Category } from '@/lib/config/category.config';
import { getCategoryList } from '@/lib/server.actions';
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import FooterMobile from './FooterMobile';
import { FooterConfig } from '@/lib/config/global.config';

const Footer = async (): AsyncReactElement => {
  const response = await getCategoryList();
  if (response.status !== ServerActionStatus.SUCCESS) {
    return <div>{response.message}</div>;
  }
  const categories: Category[] = response.data;


  const footerSections: FooterConfig[] = [
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
  ];

  const socialMediaLinks = [
    { icon: <InstagramIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <FacebookIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <TwitterIcon className='max-sm:max-w-9' />, href: '#' },
  ];


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
                      className="text-content-1 lg:text-title-2 font-normal opacity-90 hover:opacity-100 transition-all duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="space-y-4 text-skin-white flex flex-col">
            <h6 className="text-title-2 lg:text-title-1 font-semibold uppercase">Shop</h6>
            <ul className="space-y-2.5">
              {categories.length > 0 ? categories.slice(0, 8).map((category, idx) => (
                <li key={idx}>
                  <Link
                    href={`/${category.slug}`}
                    passHref
                    className="text-content-1 lg:text-title-2 font-normal opacity-90 hover:opacity-100 transition-all duration-300"
                  >
                    {category.name}
                  </Link>
                </li>
              )) : null}
            </ul>
          </div>
        </div>

        {/* Mobile Section */}
        <div className='w-full md:hidden'>
          <FooterMobile footerSections={footerSections} categories={categories} />
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
