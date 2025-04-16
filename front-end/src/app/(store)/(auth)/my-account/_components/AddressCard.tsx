'use client'

import { EditIcon2, TrashIcon2 } from '@/components/Icons'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react'
import React from 'react'
import { AddressFormData } from '@/lib/config/address.config'
import { useAddress } from '@/lib/context/AddressContext'
import AddressForm from './AddressForm'
import { Address } from '@/lib/config/user.config'

interface AddressCardProps {
  address: Address;
}

const AddressCard: React.FC<AddressCardProps> = ({ address }) => {
  const { deleteAddress, updateAddress } = useAddress();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteAddress(address.id);
      onDeleteClose();
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: AddressFormData) => {     
    try {
      setIsSubmitting(true);
      await updateAddress(address.id, data);
      onEditClose();
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='bg-skin-white p-3.5 flex items-start justify-between gap-2 border border-skin-neutral-200 rounded-10 shadow-base'>
        <div className='space-y-1.5'>
          <h3 className='text-content-1 md:text-title-2 font-bold text-skin-neutral-500 capitalize'>
            {address.name} {address.last_name}
          </h3>
          <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
            {address.street}{address.apartment ? `, ${address.apartment}` : ''}
          </p>
          {
            address.company_name && (
              <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>
                {address.company_name}
              </p>
            )
          }
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
            className="rounded-10 bg-red-gradient-100"
            onPress={onDeleteOpen}
          >
            <TrashIcon2 className='w-4.5 h-4.5 min-w-4.5' />
          </Button>
          <Button 
            size="md" 
            isIconOnly 
            color='primary' 
            className="bg-skin-neutral-500 rounded-10"
            onPress={onEditOpen}
          >
            <EditIcon2 className='w-4.5 h-4.5 min-w-4.5' />
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Edit Address</ModalHeader>
          <ModalBody>
            <AddressForm 
              initialData={address}
              onSubmit={handleUpdate}
              onCancel={onEditClose}
              isSubmitting={isSubmitting}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Address</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this address?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={onDeleteClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isSubmitting}
              className='!bg-skin-red-400'
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddressCard
