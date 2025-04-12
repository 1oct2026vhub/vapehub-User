'use client'

import React from 'react'
import { SearchIcon, ShoppingCartIcon, UserIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import Logo from "@/components/ui/Logo";
import { Button } from "@nextui-org/button";
import { Badge, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure } from "@nextui-org/react";
import Link from 'next/link';
import ShoppingCartCardDrawer from './ShoppingCartCardDrawer';
import ShippingProgress from './ShippingProgress';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/Form';
import MobileMenu from './MobileMenu';
import { useCart } from '@/lib/context/CartContext';
import { ROUTES } from '@/lib/routes';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';

const HeaderTopBar = () => {
    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { cartItems, cartTotal, itemCount } = useCart();
    return (
        <>
            <div className="hidden lg:flex items-center justify-between gap-10">
                <Logo className='max-xl:max-w-64' />
                <div className="flex flex-1 flex-shrink justify-center items-center">
                    <Form {...searchFromConfig}>
                        <form noValidate className="w-full max-w-[650px] ">
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
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">{DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}</h6>
                        </div>
                    </Button>
                    <Link href='/my-account' className="flex items-center gap-0.5">
                        <UserIcon />
                        <div>
                            <h6 className="uppercase text-content-1 font-extrabold text-skin-neutral-400 leading-tight">welcome</h6>
                            <h6 className="uppercase text-content-1 font-extrabold primary-gradient-100 leading-none">my account</h6>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Responsive screens */}

            <div className="flex flex-col space-y-3.5 lg:hidden">
                <div className="flex items-center justify-between gap-5">
                    <MobileMenu />
                    <Logo className="max-w-[174px] max-h-[28px] ml-6" />
                    <div className="flex items-center gap-1">
                        <Link href='/my-account'>
                            <UserIcon />
                        </Link>
                        <Badge content={itemCount} size="md" className="bg-skin-white border-[#DCDCDC] text-skin-black text-content-2 font-bold">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                startContent={<ShoppingCartIcon />}
                                onPress={onOpen}
                            />
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
            </div>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} className='filter-drawer rounded-l-32 md:!w-[637px] max-w-[90%] md:!max-w-[637px]'>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1 border-b border-skin-neutral-100">
                                <h4 className='primary-gradient-600 text-title-1 font-bold w-fit'>Shopping Cart</h4>
                            </DrawerHeader>
                            <DrawerBody className='max-sm:px-4'>
                                <div className='space-y-5 my-3'>
                                    {cartItems.length > 0 ? (
                                        cartItems.map((item, idx) => (
                                            <ShoppingCartCardDrawer key={idx} item={item} showAddMoreItem />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                                            <p className="text-content-2 text-skin-neutral-500">Your cart is empty</p>
                                            <Button as={Link} href={ROUTES.SHOP} color="primary" className="shadow-button" onPress={onClose}>
                                                Continue Shopping
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </DrawerBody>
                            {cartItems.length > 0 && (
                            <DrawerFooter className='flex flex-col gap-6 py-6 border-t border-skin-neutral-100s'>
                                <Divider />
                                <ShippingProgress />
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between text-black font-semibold'>
                                        <p className='text-content-2 md:text-title-1'>Total</p>
                                        <p className='text-title-2 md:text-h5'>{DEFAULT_CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</p>
                                    </div>
                                    <Button
                                        as={Link}
                                        href={ROUTES.CHECKOUT}
                                        size="lg"
                                        radius="md"
                                        color="primary"
                                        className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                        onPress={onClose}
                                    >
                                        Checkout Now
                                    </Button>
                                    <div className='flex items-center gap-3'>
                                        <Button
                                            as={Link}
                                            href={ROUTES.SHOP}
                                            size="lg"
                                            radius="md"
                                            color="primary"
                                            className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                            onPress={onClose}
                                        >
                                            Keep Shopping
                                        </Button>
                                        <Button
                                            as={Link}
                                            href={ROUTES.SHOPPING_CART}
                                            size="lg"
                                            radius="md"
                                            color="primary"
                                            className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                            onPress={onClose}
                                        >
                                            View Cart
                                        </Button>
                                    </div>
                                </div>

                            </DrawerFooter>
                            )}
                        </>
                    )}
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default HeaderTopBar
