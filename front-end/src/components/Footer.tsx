import React from 'react';
import Logo from './ui/Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';

const Footer = () => {
  const footerSections = [
    {
      title: 'Categories',
      links: [
        'Disposables',
        'Vape Kits',
        'E-Liquids',
        'Nic Salts',
        'Short Fills',
        'Tanks',
        'Coils',
      ],
    },
    {
      title: 'Brands',
      links: [
        'BAR JUICE',
        'DINNER LADY',
        'DOOZY VAPE CO',
        'ELF BAR',
        'ELUX',
        'HAYATI',
        'IVG',
      ],
    },
    {
      title: 'Legal',
      links: [
        'Delivery Information',
        'Privacy Policy',
        'Returns Policy',
        'Terms & Conditions',
      ],
    },
    {
      title: 'Deals',
      links: [
        'Nic Salts 5 for £10',
        'Disposables 3 for £10',
        'Disposables 3 for £27',
        'Disposables 3 for £30',
        'Disposables 3 for £35',
        'Shortfills 3 for £25',
        'Pods 3 for £14',
      ],
    },
    {
      title: "Let's Connect",
      links: ['Contact Us', 'Social Media'],
    },
  ];

  const socialMediaLinks = [
    { icon: <InstagramIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <FacebookIcon className='max-sm:max-w-9' />, href: '#' },
    { icon: <TwitterIcon className='max-sm:max-w-9'/>, href: '#' },
  ];

  return (
    <footer className="bg-footer-gradient space-y-6 xl:space-y-12 mt-auto">
      <div className="px-4 lg:px-10 pt-10 xl:pb-11 flex flex-col xl:flex-row items-start justify-between gap-x-5 space-y-8 xl:space-y-0">
        {/* Left Sections */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[30px] justify-between w-full">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4 text-skin-white flex flex-col max-sm:last:-mt-28">
              <h6 className="text-title-2 lg:text-title-1 font-semibold">{section.title}</h6>
              <ul className="space-y-2.5">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-content-1 lg:text-title-2 font-bold opacity-90 hover:ml-1 transition-all duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex flex-col xl:items-end items-center max-xl:mx-auto xl:min-h-[270px]">
          <Logo className="max-w-56 max-h-9" />
          <div className="text-skin-white text-center xl:text-right mt-2 xl:mt-auto">
            <h4 className="text-title-2 font-bold">Customer Services</h4>
            <a href='mailto:customerservices@vapehub.co.uk' className="text-content-2 lg:text-content-1 font-bold whitespace-nowrap hover:underline">
              Email us: customerservices@vapehub.co.uk
            </a>
            <div className="flex items-center gap-4.5 justify-center xl:justify-end mt-4 xl:mt-5.5">
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
