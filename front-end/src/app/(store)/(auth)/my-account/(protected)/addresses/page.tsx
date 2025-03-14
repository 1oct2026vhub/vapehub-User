'use client'

import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import InputForm from "@/components/InputForm";
import { Button } from "@nextui-org/button";
import AddressCard from "../../_components/AddressCard";
import LogoutButton from "../../_components/LogoutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const AccountAddresses: NextPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.MY_ACCOUNT);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Redirecting to login...</div>;
  }

  return (
    <main>
      <MyAccountHeading />
      <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold leading-none">
            Manage Addresses
          </h2>

          {/* Show "Add New" link only if the form is hidden */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="primary-gradient-100 text-content-2 md:text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
            >
              Add New
            </button>
          )}
        </div>

        {/* Address Form - Visible only when showForm is true */}
        {showForm && (
          <form className="space-y-4.5 p-5 bg-skin-white border border-skin-neutral-300 rounded-xl">
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <InputForm type="text" label="First Name" isRequired className="w-full" />
              <InputForm type="text" label="Last Name" isRequired className="w-full" />
            </div>
            <InputForm
              type="text"
              label="Start typing the first line of your address"
              isRequired
              className="w-full"
            />
            <InputForm type="text" label="Address Line 2" isRequired className="w-full" />
            <InputForm type="text" label="Address Line 3" className="w-full" />
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <InputForm type="text" label="City" isRequired className="w-full" />
              <InputForm type="tel" label="Pincode" isRequired className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <InputForm type="text" label="State" isRequired className="w-full" />
              <InputForm type="text" label="Country" isRequired className="w-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4.5 justify-end">
              <Button
                type="button"
                size="lg"
                radius="md"
                color="primary"
                className="btn text-content-1 max-md:h-10 primary-outline-btn rounded-10 !font-extrabold"
                onPress={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                radius="md"
                color="primary"
                className="btn text-content-1 max-md:h-10 primary-btn rounded-10 !font-extrabold"
              >
                Save
              </Button>
            </div>
          </form>
        )}

        {/* Address List */}
        <AddressCard />
        <AddressCard />
      </div>

      {/* Mobile Logout Section */}
      <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
        <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
      </div>
    </main>
  );
};

export default AccountAddresses;
