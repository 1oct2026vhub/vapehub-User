'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import LogoutButton from "./LogoutButton";

const menuItems = [
  { label: "My Orders", path: "/my-account/orders" },
  { label: "Personal Information", path: "/my-account/personal-info" },
  { label: "Manage Addresses", path: "/my-account/addresses" },
  { label: "Security", path: "/my-account/security" },
  { label: "Referrals", path: "/my-account/referrals" },
  { label: "Loyalty Points", path: "/my-account/loyalty-points" },
];

const AccountSidebar: React.FC = () => {
  const pathname = usePathname();


  return (
    <div className="bg-skin-base md:bg-skin-white px-3.5 py-2.5 md:p-5 xl:p-9 rounded-14 shadow-checkout flex flex-col h-full justify-between overflow-y-auto min-w-fit max-md:w-full max-md:border border-skin-neutral-100">
      <ul className="w-full grid max-md:grid-cols-2 max-md:gap-2 md:space-y-1">
        {menuItems.map((item) => (
          <li key={item.path} className="w-full">
            <Link
              href={item.path}
              className={`p-2 md:px-4 md:py-3 text-content-2 md:text-content-1 text-nowrap justify-center md:justify-start font-semibold rounded-lg md:rounded-10 w-full flex transition-colors ${pathname === item.path
                  ? "bg-primary-gradient-100 md:bg-primary-gradient-600 text-skin-white max-sm:border border-skin-primary-500"
                  : "text-skin-primary-500 max-md:border border-skin-primary-400 md:hover:bg-skin-primary-50"
                }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 md:flex !justify-start text-content-1 font-semibold hidden" />
    </div>
  );
};

export default AccountSidebar;
