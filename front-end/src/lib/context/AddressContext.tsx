'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AddressFormData } from '@/lib/config/address.config';
import { addUserAddress, deleteUserAddress, getUserAddresses, updateUserAddress } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { Address, USER_ADDRESS_RESPONSE } from '@/lib/config/user.config';
import { useSession } from 'next-auth/react';
import { DEFAULT_COUNTRY } from '../utils/address.utils';

interface AddressContextType {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  addAddress: (address: AddressFormData) => Promise<void>;
  updateAddress: (id: number, address: AddressFormData) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  fetchAddresses: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

interface AddressProviderProps {
  children: ReactNode;
}

export const AddressProvider: React.FC<AddressProviderProps> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserAddresses();
      
      if (response.status === ServerActionStatus.SUCCESS) {
        // Assuming the response data structure matches what we need
        // You may need to adjust this based on the actual API response
        const addressData = response.data as USER_ADDRESS_RESPONSE;
        setAddresses(addressData.UserAddresses || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while fetching addresses');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (addressData: AddressFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert AddressFormData to USER_ADDRESS_PAYLOAD
      const payload = {
        name: addressData.name,
        last_name: addressData.last_name,
        company_name: addressData.company_name || '',
        country: addressData.country || DEFAULT_COUNTRY,
        street: addressData.street,
        apartment: addressData.apartment || '',
        town: addressData.town, 
        region: addressData.region,
        post_code: addressData.post_code,
        phone: addressData.phone || '',
      };
      
      const response = await addUserAddress(payload); 
      if (response.status === ServerActionStatus.SUCCESS) {
        // Show success message
        await fetchAddresses();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while adding address');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: number, addressData: AddressFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert AddressFormData to USER_ADDRESS_PAYLOAD
      const payload = {
        name: addressData.name,
        last_name: addressData.last_name,
        company_name: addressData.company_name || '',
        country: addressData.country || DEFAULT_COUNTRY,
        street: addressData.street,
        apartment: addressData.apartment || '',
        town: addressData.town, 
        post_code: addressData.post_code,
        phone: addressData.phone || '',
        region: addressData.region,
      };
      
      const response = await updateUserAddress(id, payload);
      
      if (response.status === ServerActionStatus.SUCCESS) {
        // Show success message
        await fetchAddresses();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while updating address');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await deleteUserAddress(id);
      
      if (response.status === ServerActionStatus.SUCCESS) {
        // Show success message
        await fetchAddresses();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while deleting address');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const value = {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}; 