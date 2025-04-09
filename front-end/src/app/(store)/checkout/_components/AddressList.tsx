import { FunctionComponent } from "react";
import { useAddress } from "@/lib/context/AddressContext";
import { RadioGroup } from "@nextui-org/react";
import { CustomRadio } from "@/components/CustomRadio";
import { type Address } from "@/lib/config/user.config";

interface AddressListProps {
  selectedAddressId?: number;
  onAddressSelect: (address: Address) => void;
}

const AddressList: FunctionComponent<AddressListProps> = ({ selectedAddressId, onAddressSelect }) => {
  const { addresses } = useAddress();

  return (
    <RadioGroup
      value={selectedAddressId?.toString()}
      onValueChange={(value) => {
        const selectedAddress = addresses.find((addr) => addr.id.toString() === value);
        if (selectedAddress) {
          onAddressSelect(selectedAddress);
        }
      }}
    >
      {addresses.map((address) => (
        <CustomRadio key={address.id} value={address.id.toString()}>
          <div className='bg-skin-white p-3.5 flex items-start justify-between gap-2 border border-skin-neutral-200 rounded-10 shadow-base w-full'>
            <div className='space-y-1.5'>
              <h3 className='text-content-1 md:text-title-2 font-bold text-skin-neutral-500 capitalize'>
                {address.name} {address.last_name}
              </h3>
              <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
                {address.street}{address.apartment ? `, ${address.apartment}` : ''}
              </p>
              <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
                {address.town}, {address.region}, {address.post_code}
              </p>
              <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
                {address.country}
              </p>
              {address.phone && (
                <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
                  Phone: {address.phone}
                </p>
              )}
            </div>
          </div>
        </CustomRadio>
      ))}
    </RadioGroup>
  );
};

export default AddressList;
