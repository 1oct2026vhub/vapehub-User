'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const menuItems = [
  { label: "Your Orders", path: "/my-account/orders" },
  { label: "Personal Information", path: "/my-account/personal-info" },
  { label: "Manage Addresses", path: "/my-account/addresses" },
  { label: "Payment Methods", path: "/my-account/payment-methods" },
  { label: "Security", path: "/my-account/security" },
  { label: "Referrals", path: "/my-account/referrals" },
];

const AccountSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="bg-skin-base md:bg-skin-white px-3.5 py-2.5 md:p-5 xl:p-9 rounded-14 shadow-checkout flex flex-col md:min-h-[670px] justify-between overflow-y-auto min-w-fit max-md:w-full max-md:border border-skin-neutral-100">
      <ul className="w-full grid max-md:grid-cols-2 max-md:gap-2 space-y-1">
        {menuItems.map((item) => (
          <li key={item.path} className="w-full">
            <Link
              href={item.path}
              className={`p-2 md:px-4 md:py-3 text-content-2 md:text-content-1 text-nowrap justify-center md:justify-start font-semibold rounded-lg md:rounded-10 w-full flex transition-colors ${
                pathname === item.path
                  ? "bg-primary-gradient-600 text-skin-white"
                  : "text-skin-primary-500 max-md:border border-skin-primary-400 hover:bg-skin-primary-50"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/logout" className="mt-auto red-gradient-100 px-4 py-3 md:flex text-content-1 font-semibold hidden">
        Logout
      </Link>
    </div>
  );
};

export default AccountSidebar;
