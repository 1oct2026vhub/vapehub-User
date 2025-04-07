'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressFormData, addressSchema } from '@/lib/config/address.config';
import InputField from '@/components/InputField';
import { Button } from '@nextui-org/button';

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    control,
    handleSubmit,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'all',
    defaultValues: initialData || {
      name: '',
      last_name: '',
      street: '',
      apartment: '',
      company_name: '',
      town: '',
      county: '',
      post_code: "",
      country: '',
      phone: '',
    },
  });

  return (
    <form className="space-y-4.5 p-5 bg-skin-white border border-skin-neutral-300 rounded-xl" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-2.5 md:gap-4">
        <InputField
          control={control}
          name="name"
          label="First Name"
          placeholder="Enter your first name"
          isRequired
          className="w-full"
        />
        <InputField
          control={control}
          name="last_name"
          label="Last Name"
          placeholder="Enter your last name"
          isRequired
          className="w-full"
        />
      </div>
      
      <InputField
        control={control}
        name="street"
        label="Street Address"
        placeholder="Enter your street address"
        isRequired
        className="w-full"
      />
      
      <InputField
        control={control}
        name="apartment"
        label="Apartment, suite, etc. (optional)"
        placeholder="Apartment, suite, unit, building, floor, etc."
        className="w-full"
      />
      <InputField
        control={control}
        name="company_name"
        label="Company Name"
        placeholder="Enter your company name (optional)"
        className="w-full"
      />
      
      <div className="grid grid-cols-2 gap-2.5 md:gap-4">
        <InputField
          control={control}
          name="town"
          label="Town/City"
          placeholder="Enter your town or city"
          isRequired
          className="w-full"
        />
        <InputField
          control={control}
          name="post_code"
          label="Postcode"
          placeholder="Enter your postcode"
          isRequired
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2.5 md:gap-4">
        <InputField
          control={control}
          name="county"
          label="County/Region"
          placeholder="Enter your county or region"
          isRequired
          className="w-full"
        />
        <InputField
          control={control}
          name="country"
          label="Country"
          placeholder="Enter your country"
          isRequired
          className="w-full"
        />
      </div>
      
      <InputField
        control={control}
        type="number"
        name="phone"
        label="Phone Number (optional)"
        placeholder="Enter your phone number"
        className="w-full"
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-4.5 justify-end">
        <Button
          type="button"
          size="lg"
          radius="md"
          color="primary"
          className="btn text-content-1 max-md:h-10 primary-outline-btn rounded-10 !font-extrabold"
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          radius="md"
          color="primary"
          className="btn text-content-1 max-md:h-10 primary-btn rounded-10 !font-extrabold"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm; 