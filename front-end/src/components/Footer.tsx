import React, { Suspense } from 'react';
import Logo from './ui/Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';
import Link from 'next/link';
import { getFooterMenu } from '@/lib/server.actions';
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import FooterMobile from './FooterMobile';
import { FooterMenu, FooterMenuLink } from '@/lib/config/header.config';
import SuspenseLoader from './ui/SuspenseLoader';
import Subscription from '@/app/(store)/(dashboard)/_components/Subscription';

const Footer = async (): AsyncReactElement => {
  const footerMenuResponse = await getFooterMenu();   

  if (footerMenuResponse.status === ServerActionStatus.ERROR) {
    return <div>{footerMenuResponse.message}</div>;
  }

  // Add safe checks for data and socialLinks
  const footerMenu = footerMenuResponse.data || [];
  const socialLinks = footerMenuResponse.socialLinks || {};

  // Add safe checks for filtering and sorting
  const sortedFooterMenu = (footerMenu || [])
    .filter((menu: FooterMenu) => menu?.is_active)
    .sort((a: FooterMenu, b: FooterMenu) => (a?.order || 0) - (b?.order || 0))
    .map((menu: FooterMenu) => ({
      ...menu,
      links: (menu?.links || [])
        .filter((link: FooterMenuLink) => link?.is_active)
        .sort((a: FooterMenuLink, b: FooterMenuLink) => (a?.order || 0) - (b?.order || 0))
    }))
    .filter((menu: FooterMenu) => menu?.links?.length > 0); // Only keep sections with active links

  const socialMediaLinks = [
    { 
      icon: <InstagramIcon className='max-sm:max-w-9' />, 
      href: socialLinks.instagram || '#' 
    },
    { 
      icon: <FacebookIcon className='max-sm:max-w-9' />, 
      href: socialLinks.facebook || '#' 
    },
    { 
      icon: <TwitterIcon className='max-sm:max-w-9' />, 
      href: socialLinks.twitter || '#' 
    },
  ].filter(link => link.href !== '#'); // Remove links that are not set

  return (
    <footer className="bg-footer-gradient mt-7">
      <Suspense fallback={<SuspenseLoader />}>
        <Subscription />
      </Suspense>
      <div className="px-4 lg:px-10 py-7 md:py-10 flex flex-col md:flex-row items-start justify-between gap-x-7 gap-y-6 md:gap-y-0 max-w-[1520px] mx-auto">
        {/* Left Sections */}
        <div className="hidden md:flex flex-1 gap-5 lg:gap-8 justify-start">
          {sortedFooterMenu.map((section) => (
            <div key={section.id} className={`space-y-4 text-skin-white flex flex-col flex-1 min-w-0`}>
              <div className="!font-oswald text-title-2 lg:text-h5 font-semibold !capitalize">{section.title}</div>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-content-1 lg:text-title-2 font-normal opacity-90 hover:opacity-100 hover:underline transition-all duration-100 !capitalize"
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
            <div className="!font-oswald text-xl font-bold">Customer Services</div>
            <div className='text-content-2 font-semibold text-skin-neutral-100'>
              Email us: 
              <a href={`mailto:${socialLinks.email || 'customerservices@vapehub.co.uk'}`} className="whitespace-nowrap hover:underline ml-1">
                {socialLinks.email || 'customerservices@vapehub.co.uk'}
              </a>
            </div>
            <div className='space-y-4 mt-2'>
                <div>
                  <p className='text-content-2 font-semibold text-skin-neutral-100'>Call us: 07508 373773</p>
                  <p className='text-content-2 font-semibold text-skin-neutral-100'>Support team available 10am to 4pm Monday to Friday</p>
                </div>
                <div>
                  <p className='text-content-2 font-semibold text-skin-neutral-100'>VH International Limited</p>
                  <p className='text-content-2 font-semibold text-skin-neutral-100'>Unit 6 Peaks Place Business Park BL1 8AS</p>
                </div>
            </div>
            <div className="flex items-center gap-4.5 justify-center md:justify-end mt-4 xl:mt-5.5">
              {socialMediaLinks.map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-skin-primary-300 py-3 text-center">
        <p className="text-content-2 font-semibold text-skin-white font-oswald">
          © Copyright {new Date().getFullYear()} VapeHub - All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
