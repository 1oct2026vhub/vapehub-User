import { FunctionComponent, useState } from "react";
import { useAddress } from "@/lib/context/AddressContext";
import { CustomRadio } from "@/components/CustomRadio";
import { type Address } from "@/lib/config/user.config";
import { EditIcon2 } from '@/components/Icons';
import { Button, RadioGroup, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react'
import { AddressFormData } from "@/lib/config/address.config";
import AddressForm from "../../(auth)/my-account/_components/AddressForm";


interface AddressListProps {
  selectedAddressId?: number;
  onAddressSelect: (address: Address) => void;
}

const AddressList: FunctionComponent<AddressListProps> = ({ selectedAddressId, onAddressSelect }) => {
  const { addresses, updateAddress } = useAddress();
  const [showAll, setShowAll] = useState(false);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const displayedAddresses = showAll ? addresses : addresses.slice(0, 3);
  const handleUpdate = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      await updateAddress(selectedAddress?.id ?? 0, data);
      onEditClose();
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
    <div className="space-y-4">
      <RadioGroup
        value={selectedAddressId?.toString()}
        onValueChange={(value) => {
          const selectedAddress = addresses.find((addr) => addr.id.toString() === value);
          if (selectedAddress) {
            onAddressSelect(selectedAddress);
          }
        }}
      >
        {displayedAddresses.map((address) => (
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
              <div className="flex items-center gap-2">

                <Button
                  size="md"
                  isIconOnly
                  color='primary'
                  type="button"
                  className="bg-skin-neutral-500 rounded-10"
                  onPress={() => {
                    onEditOpen();
                    setSelectedAddress(address);
                  }}
                >
                  <EditIcon2 className='w-4.5 h-4.5 min-w-4.5' />
                </Button>
              </div>
            </div>
            
          </CustomRadio>
        ))}
      </RadioGroup>

      {addresses.length > 3 && (
        <Button

          color="primary"
          onPress={() => setShowAll(!showAll)}
          className="w-fit float-right"
        >
          {showAll ? "Show Less" : `Show More Addresses (${addresses.length - 3} more)`}
        </Button>
      )}
    </div>
    <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1">Edit Address</ModalHeader>
      <ModalBody>
        <AddressForm
          initialData={selectedAddress as AddressFormData}
          onSubmit={handleUpdate}
          onCancel={onEditClose}
          isSubmitting={isSubmitting}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
  </>

  );
};

export default AddressList;
