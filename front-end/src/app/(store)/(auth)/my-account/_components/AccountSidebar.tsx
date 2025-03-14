'use client'

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const menuItems = [
  { label: "My Orders", path: "/my-account/orders" },
  { label: "Personal Information", path: "/my-account/personal-info" },
  { label: "Manage Addresses", path: "/my-account/addresses" },
  { label: "Security", path: "/my-account/security" },
  { label: "Referrals", path: "/my-account/referrals" },
];

const AccountSidebar: React.FC = () => {
  const pathname = usePathname();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="bg-skin-base md:bg-skin-white px-3.5 py-2.5 md:p-5 xl:p-9 rounded-14 shadow-checkout flex flex-col md:min-h-[670px] justify-between overflow-y-auto min-w-fit max-md:w-full max-md:border border-skin-neutral-100">
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
      <Button onPress={onOpen} className="mt-auto red-gradient-100 px-4 py-3 md:flex text-content-1 !justify-start font-semibold hidden">
        Logout
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log Out</ModalHeader>
              <ModalBody className='py-8'>
                <p className='text-content-1 md:text-title-2 font-semibold text-skin-neutral-500 text-center'>
                  Are you sure, Do you want to logout?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose} className="!text-content-2 md:!text-content-1 max-md:h-10 rounded-lg primary-outline-btn !font-extrabold !w-fit">
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose} className="!text-content-2 md:!text-content-1 max-md:h-10 rounded-lg primary-btn !font-extrabold !w-fit">
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AccountSidebar;
