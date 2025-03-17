'use client'

import React from 'react'
import { MenuIcon, SearchIcon, ShoppingCartIcon, UserIcon, CloseIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import Logo from "@/components/ui/Logo";
import { Button } from "@nextui-org/button";
import { Badge, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure, Accordion, AccordionItem } from "@nextui-org/react";
import Link from 'next/link';
import ShoppingCartCardDrawer from './ShoppingCartCardDrawer';
import ShippingProgress from './ShippingProgress';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/Form';
import { useCart } from '@/lib/context/CartContext';
import { ROUTES } from '@/lib/routes';

const itemClasses = {
    base: "w-full shadow-none !p-0",
    title: "!text-content-2 xl:!text-content-1 text-nowrap font-bold",
    trigger: "rounded-lg h-11 !p-3 flex items-center border border-skin-primary-400",
    indicator: "text-medium text-skin-neutral-500 -rotate-90 data-[open=true]:rotate-90",
    content: "text-content-1 !px-3 !pt-4 !pb-0 !space-y-6 rounded-lg border border-skin-neutral-200 shadow-md my-2",
};

// Placeholder for filter options
const filterOptions = [
    { title: "Category", content: <p>Filter content</p> },
    { title: "Brand", content: <p>Brand filter</p> },
];

const HeaderTopBar = () => {
    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const { cartItems, cartTotal, itemCount } = useCart();

    // Cart Drawer
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Menu Drawer
    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onOpenChange: onMenuOpenChange } = useDisclosure();

    return (
        <>
            <div className="hidden lg:flex items-center justify-between gap-10">
                <Logo className='max-xl:max-w-64' />
                <div className="flex flex-1 flex-shrink justify-center items-center">
                    <Form {...searchFromConfig}>
                        <form noValidate className="w-full max-w-[650px]">
                            <InputField
                                control={searchFromConfig.control}
                                name="search"
                                type={Header_FORM_CONFIG.SEARCH.TYPE}
                                placeholder={Header_FORM_CONFIG.SEARCH.PH}
                                className="max-w-[650px]"
                                classNames={{
                                    input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
                                }}
                                startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
                            />
                        </form>
                    </Form>
                </div>

                <div className="flex items-center gap-6">
                    <Button onPress={onOpen} variant='light' className="flex items-center gap-0.5 hover:!bg-transparent">
                        <ShoppingCartIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">{itemCount} item{itemCount !== 1 ? 's' : ''}</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">£ {cartTotal.toFixed(2)}</h6>
                        </div>
                    </Button>
                    <Link href='/my-account' className="flex items-center gap-0.5">
                        <UserIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">Welcome</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">My Account</h6>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Responsive screens */}
            <div className="flex flex-col space-y-3.5 lg:hidden">
                <div className="flex items-center justify-between gap-5">
                    <Button isIconOnly size="sm" variant="light" onPress={onMenuOpen}>
                        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </Button>
                    <Logo className="max-w-[174px] max-h-[28px] ml-6" />
                    <div className="flex items-center gap-1">
                        <Link href='/my-account'>
                            <UserIcon />
                        </Link>
                        <Badge content={itemCount} size="md" className="bg-skin-white border-[#DCDCDC] text-skin-black text-content-2 font-bold">
                            <Button isIconOnly size="sm" variant="light" onPress={onOpen}>
                                <ShoppingCartIcon />
                            </Button>
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-1 flex-shrink justify-center items-center">
                    <Form {...searchFromConfig}>
                        <form noValidate className="w-full">
                            <InputField
                                control={searchFromConfig.control}
                                name="search"
                                type={Header_FORM_CONFIG.SEARCH.TYPE}
                                placeholder={Header_FORM_CONFIG.SEARCH.PH}
                                className="w-full"
                                startContent={<SearchIcon />}
                            />
                        </form>
                    </Form>
                </div>

                <Drawer isOpen={isMenuOpen} onOpenChange={onMenuOpenChange} placement='bottom' className='filter-drawer max-h-[90vh]'>
                    <DrawerContent>
                        <DrawerHeader className="flex flex-col gap-3 pt-5 border-b border-skin-neutral-100" />
                        <DrawerBody className='pt-5'>
                            <Accordion variant="splitted" className="!p-0" itemClasses={itemClasses} selectionMode='multiple'>
                                {filterOptions.map(({ title, content }, index) => (
                                    <AccordionItem key={index} aria-label={title} title={title}>
                                        {content}
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </DrawerBody>
                        <DrawerFooter>
                            <Button color="danger" variant="bordered" onPress={onMenuOpenChange} radius='sm' size='lg'>
                                Close
                            </Button>
                            <Button color="primary" onPress={onMenuOpenChange} radius='sm' size='lg'>
                                Apply
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} className='filter-drawer rounded-l-32 md:!w-[637px]'>
                <DrawerContent>
                    <DrawerHeader className="flex flex-col gap-1 border-b border-skin-neutral-100">
                        <h4 className='primary-gradient-600 text-title-1 font-bold'>Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})</h4>
                    </DrawerHeader>
                    <DrawerBody className='max-sm:px-4 space-y-5 my-3'>
                        {cartItems.length > 0 ? (
                            cartItems.map((item, idx) => (
                                <ShoppingCartCardDrawer key={idx} item={item} showAddMoreItem />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <p className="text-content-2 text-skin-neutral-500">Your cart is empty</p>
                                <Link href={ROUTES.SHOP}>
                                    <Button color="primary" className="shadow-button">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </DrawerBody>
                    {cartItems.length > 0 && (
                        <DrawerFooter className='flex flex-col gap-6 py-6 border-t border-skin-neutral-100'>
                            <ShippingProgress />
                            <Link href="/checkout" className="w-full">
                                <Button size="lg" color="primary" className="w-full">
                                    Checkout Now (£{cartTotal.toFixed(2)})
                                </Button>
                            </Link>
                        </DrawerFooter>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default HeaderTopBar;
