'use client'

import MyAccountHeading from '@/components/ui/MyAccountHeading'
import { NextPage } from 'next'
import React, { useState } from 'react'
import AccountSidebar from '../_components/AccountSidebar'
import Link from 'next/link'
import InputForm from '@/components/InputForm'
import { Button } from '@nextui-org/button'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'

const PersonalInfo: NextPage = () => {

    const [showButtons, setShowButtons] = useState(false);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <main className="px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10">
            <MyAccountHeading />
            <section className="flex flex-col md:flex-row items-start justify-between gap-4">
                <AccountSidebar />
                <div className="p-4 bg-skin-white rounded-14 shadow-card space-y-4.5 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                    <div className='flex items-center gap-4'>
                        <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold leading-none">Personal Information</h2>
                        {!showButtons && (
                            <button
                                onClick={() => setShowButtons(true)}
                                className="pr-8 primary-gradient-100 text-content-2 md:text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <form className='space-y-4 md:space-y-6'>
                        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-4">
                            <InputForm type="text" placeholder="Neerajdev" className="w-full" />
                            <InputForm type="text" placeholder="R" className="w-full" />
                        </div>
                        <div className='space-y-3 md:space-y-4.5 sm:pr-4'>
                            <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Email</h2>
                            <InputForm
                                type='email'
                                placeholder='neerajdev@gmail.com'
                                className='w-full sm:max-w-[50%]'
                            />
                        </div>
                        <div className='space-y-3 md:space-y-4.5 sm:pr-4'>
                            <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Mobile Number</h2>
                            <InputForm
                                type='tel'
                                placeholder='8075999260'
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
                                    onPress={() => setShowButtons(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    radius="md"
                                    color="primary"
                                    className="btn !text-content-2 md:!text-content-1 max-md:h-10 rounded-10 primary-btn !font-extrabold"
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
                    </form>
                </div>
                <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full">
                    <Link href="#" className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold">
                        Logout
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default PersonalInfo
