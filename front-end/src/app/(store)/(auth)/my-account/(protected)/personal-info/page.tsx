'use client'

import { NextPage } from 'next'
import React, { useState, useEffect } from 'react' 
import { Button } from '@nextui-org/button'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import LogoutButton from '../../_components/LogoutButton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userProfileSchema, UserProfileFormData } from '@/lib/config/user.config'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { toast } from 'sonner'
import { ServerActionStatus } from '@/lib/config/app.config'
import InputField from '@/components/InputField' 
import { signOut } from 'next-auth/react'
import { ROUTES } from '@/lib/routes'
import { Form } from '@/components/ui/Form'
const PersonalInfo: NextPage = () => {
    const [showButtons, setShowButtons] = useState(false)
    const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure()
    const { fetchProfile, updateProfile, deleteProfile, isLoading } = useUserProfile();
    const [loading, setLoading] = useState(true);
     const form = useForm<UserProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        mode: 'all',
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: ''
        }
    })
    const loadProfile = async () => {
        const result = await fetchProfile(); 
        if (result) {
            form.reset({
                first_name: result.first_name || '',
                last_name: result.last_name || '',
                email: result.email || '',
                phone: result.phone || ''
            })
            setLoading(false)
        }
    }
    useEffect(() => {        
        loadProfile()
    }, [])

    const onSubmit = async (data: UserProfileFormData) => {
        const result = await updateProfile(data)
        if (result?.status === ServerActionStatus.SUCCESS) {
            toast.success('Profile updated successfully')
            setShowButtons(false)
        } else {
            toast.error('Failed to update profile')
        }
    }

    const handleDeleteAccount = async () => {
        const result = await deleteProfile()
        if (result?.status === ServerActionStatus.SUCCESS) {
            toast.success("Account deleted successfully");
            onClose();
            signOut({ callbackUrl: ROUTES.MY_ACCOUNT }); 
        }  
    }
    if(loading) {
        return <p>Loading..</p>
    }

    return (
        <main>
           
            <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <div className='flex items-center gap-4'>
                    <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold leading-none">Personal Information</h2>
                    {!showButtons && (
                        <button
                            onClick={() => setShowButtons(true)}
                            className="primary-gradient-100 text-content-2 md:text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
                        >
                            Edit
                        </button>
                    )}
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='space-y-4 md:space-y-6'>
                        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-4">
                            <div className='space-y-3 md:space-y-4.5'>
                            <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">First Name</h3>
                            <InputField
                                control={form.control}
                                name='first_name'
                                type='text'
                                isDisabled={!showButtons}
                                className='w-full'
                            />
                             
                        </div>
                        <div className='space-y-3 md:space-y-4.5'>
                            <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Last Name</h3>
                            <InputField
                                control={form.control}
                                name='last_name'
                                type='text'
                                isDisabled={!showButtons}
                                className='w-full'
                            />
                            
                        </div>
                    </div>
                    <div className='space-y-3 md:space-y-4.5 sm:pr-4'>
                        <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Email</h3>
                        <InputField
                            control={form.control}
                            name='email'
                            type='email'
                            isDisabled
                            className='w-full sm:max-w-[50%]'
                        />
                         
                    </div>
                    <div className='space-y-3 md:space-y-4.5 sm:pr-4'>
                        <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                          Mobile Number<span className="text-red-500"> *</span>
                        </h3>
                        <InputField
                            control={form.control}
                            name='phone'
                            type='tel'
                            isDisabled={!showButtons}
                            className='w-full sm:max-w-[50%]'
                        />
                        
                    </div>
                    {showButtons && (
                        <div className="flex items-center gap-4.5 pt-6">
                            <Button
                                type="button"
                                size="lg"
                                radius="md"
                                color="primary"
                                className="btn !text-content-2 md:!text-content-1 max-md:h-10 rounded-10 primary-outline-btn !font-extrabold"
                                onPress={() => {setShowButtons(false); loadProfile()}}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                radius="md"
                                color="primary"
                                className="btn !text-content-2 md:!text-content-1 max-md:h-10 rounded-10 primary-btn !font-extrabold"
                                isLoading={isLoading}
                                isDisabled={isLoading}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    <Button
                        type="button"
                        size="lg"
                        radius="md"
                        color="danger"
                        className="btn !text-content-2 md:!text-content-1 max-md:h-10 rounded-10 !font-extrabold text-skin-white !bg-skin-red-400"
                        onPress={onOpen}
                    >
                        Delete Account
                    </Button>
                    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Delete Account</ModalHeader>
                                    <ModalBody className='py-8'>
                                        <p className='text-content-1 md:text-title-2 font-semibold text-skin-neutral-500 text-center'>
                                            Are you sure do you want to delete your account?
                                        </p>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onPress={onClose}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            color="danger"
                                            onPress={handleDeleteAccount}
                                            isLoading={isLoading}
                                            className='!bg-skin-red-400'
                                        >
                                            Delete
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                    </form>
                </Form>
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    )
}

export default PersonalInfo
