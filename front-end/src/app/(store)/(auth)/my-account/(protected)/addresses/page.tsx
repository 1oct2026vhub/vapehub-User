'use client'

import MyAccountHeading from "@/components/ui/MyAccountHeading";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import AddressCard from "../../_components/AddressCard";
import LogoutButton from "../../_components/LogoutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { AddressProvider, useAddress } from "@/lib/context/AddressContext";
import AddressForm from "../../_components/AddressForm";
import { AddressFormData } from "@/lib/config/address.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

const AddressesContent: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  const { addresses, isLoading, error, addAddress } = useAddress();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.MY_ACCOUNT);
    }
  }, [status, router]);

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      await addAddress(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="text-center py-4">Loading addresses...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : addresses.length === 0 ? (
          <EmptyPlaceholder
            title="No addresses found"
            description="Add your first address above."
          />
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Logout Section */}
      <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
        <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
      </div>
    </main>
  );
};

const AccountAddresses: NextPage = () => {
  return (
    <AddressProvider>
      <AddressesContent />
    </AddressProvider>
  );
};

export default AccountAddresses;
