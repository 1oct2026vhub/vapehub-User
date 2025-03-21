'use client'

import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Accordion, AccordionItem, Badge, Divider } from '@nextui-org/react';
import { CloseIcon, DownArrowFilledIcon, MenuIcon, ShoppingCartIcon, UserIcon } from '@/components/Icons';
import Logo from './ui/Logo';
import Link from 'next/link';
import ShoppingCartCardDrawer from './ShoppingCartCardDrawer';
import ShippingProgress from './ShippingProgress';
import InputField from '@/components/InputField'
import { Form } from '@/components/ui/Form';
import { ServerActionStatus } from '@/lib/config/app.config';
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { subscribeMail } from '@/lib/server.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import MobileSubMenu from './MobileSubMenu';
import { useCart } from '@/lib/context/CartContext';
import { ROUTES } from '@/lib/routes';

const MobileMenu = () => {
    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
    const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [isFooterVisible, setFooterVisible] = useState(true);
    const { cartItems, cartTotal, itemCount } = useCart();
    const itemClasses = {
        base: "w-full rounded-lg shadow-input border border-skin-neutral-100",
        title: "text-title-2 font-bold uppercase",
        trigger: '!py-2.5',
        indicator: "text-medium text-skin-neutral-50 data-[open=true]:rotate-180",
        content: "py-4 border-t border-skin-neutral-200",
    };

    const filterOptions = [
        { title: "New In", content: <MobileSubMenu /> },
        { title: "Disposables", content: <MobileSubMenu /> },
        { title: "Pod Kits", content: <MobileSubMenu /> },
        { title: "Vape Kits", content: <MobileSubMenu /> },
        { title: "Nic Salts", content: <MobileSubMenu /> },
        { title: "E-liquids", content: <MobileSubMenu /> },
        { title: "Pouches & Strips", content: <MobileSubMenu /> },
        { title: "Hardware", content: <MobileSubMenu /> },
        { title: "Brands" },
        { title: "Blogs" },
        { title: "Deals" },
    ];

    const subscribeFromConfig = useForm<SubscribeFormSchema>({
        resolver: zodResolver(SUBSCRIBE_IN_SCHEMA),
        mode: 'onSubmit',
    });

    const handleFormSubmit = async ({ email }: SubscribeFormSchema) => {
        const response = await subscribeMail(email);
        if (response.status === ServerActionStatus.ERROR) {
            toast.error(response.message);
            return;
        }
        toast.success("You have successfully subscribed");
        subscribeFromConfig.reset({ email: '' });
    }



    const handleAccordionItemClick = (index: number) => {
        setOpenItems((prevOpenItems) => {
            const isCurrentlyOpen = prevOpenItems.includes(index);
            const newOpenItems = isCurrentlyOpen
                ? prevOpenItems.filter(item => item !== index) // Remove if already open
                : [...prevOpenItems, index]; // Add if not open

            setFooterVisible(newOpenItems.length === 0); // Hide footer if any item is open
            return newOpenItems;
        });
    };

    // Ensure the footer is visible when closing the drawer
    const handleMenuClose = () => {
        setFooterVisible(true); // Reset footer visibility
        setOpenItems([]); // Clear open accordion items
        onMenuClose();
    };


    return (
        <div>
            <div
                typeof='button'
                onClick={onMenuOpen}
            >
                {<MenuIcon className='z-10 relative' />}
            </div>
            <Drawer isOpen={isMenuOpen} onOpenChange={handleMenuClose} placement='bottom' className='max-h-[99vh] min-h-[99vh] rounded-t-32' classNames={{
                closeButton: '!hidden'
            }}>
                <DrawerContent>
                    <DrawerHeader className='flex justify-between items-center border-b border-skin-neutral-200 p-5'>
                        <div
                            typeof='button'
                            onClick={handleMenuClose}
                        >
                            {<CloseIcon className='z-10 relative w-6 h-6' />}
                        </div>
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
                                    onPress={onCartOpen}
                                />
                            </Badge>
                        </div>
                    </DrawerHeader>
                    <DrawerBody className='py-4 px-4'>
                        {/* Accordion Filters */}
                        <Accordion variant="splitted" className="!p-0" itemClasses={itemClasses} selectionMode='multiple'>
                            {filterOptions.map(({ title, content }, index) => (
                                <AccordionItem
                                    key={title}
                                    aria-label={title}
                                    title={title}
                                    indicator={<DownArrowFilledIcon color='black' />}
                                    onPress={() => handleAccordionItemClick(index)}
                                >
                                    {content}
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </DrawerBody>
                    {isFooterVisible && openItems.length === 0 && (
                        <DrawerFooter className='py-4 px-4 space-y-6 flex-col border-t border-skin-neutral-200'>
                            <div className='p-4.5 bg-subscription-banner-mob bg-no-repeat bg-top rounded-lg bg-cover space-y-4 w-full'>
                                <h2 className='text-content-2 font-semibold text-skin-white'>Signup Now to get rewarded</h2>
                                <Form {...subscribeFromConfig}>
                                    <form className='space-y-1.5 subscription-form'
                                        onSubmit={subscribeFromConfig.handleSubmit(handleFormSubmit)}
                                        noValidate >
                                        <InputField control={subscribeFromConfig.control}
                                            name="email"
                                            type={SUBSCRIBE_FORM_CONFIG.EMAIL.TYPE}
                                            placeholder={SUBSCRIBE_FORM_CONFIG.EMAIL.PH}
                                            isRequired />

                                        <Button
                                            size="sm"
                                            radius="sm"
                                            color="primary"
                                            type='submit'
                                            disabled={subscribeFromConfig.formState.isSubmitting}
                                            isLoading={subscribeFromConfig.formState.isSubmitting}
                                            className="btn !rounded-md bg-skin-neutral-500 !text-skin-white shadow-input text-content-3 !py-1.5 !px-2.5"
                                        >
                                            Subscribe & Save 10%
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                            <div className='text-center space-y-2'>
                                <h2 className='primary-gradient-600 text-title-1 font-bold'>Customer Support Hours</h2>
                                <div>
                                    <p className='text-content-2 font-semibold text-skin-neutral-400'>10:00am - 3:30pm</p>
                                    <div className='text-content-2 font-semibold text-skin-neutral-400'>
                                        Email us: <Link href='mailto:customerservices@vapehub.co.uk' className=''>customerservices@vapehub.co.uk</Link>
                                    </div>
                                </div>
                            </div>
                        </DrawerFooter>
                    )}
                </DrawerContent>
            </Drawer>

            <Drawer isOpen={isCartOpen} onOpenChange={onCartClose} className='filter-drawer rounded-l-32 md:!w-[637px] max-w-[90%] md:!max-w-[637px]'>
                <DrawerContent>
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
                                            <Link href={ROUTES.SHOP}>
                                                <Button color="primary" className="shadow-button">
                                                    Continue Shopping
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                        </div>
                    </DrawerBody>
                    <DrawerFooter className='flex flex-col gap-6 py-6 border-t border-skin-neutral-100s'>
                        <Divider />
                        <ShippingProgress />
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between text-black font-semibold'>
                                <p className='text-content-2 md:text-title-1'>Total</p>
                                <p className='text-title-2 md:text-h5'>£{cartTotal.toFixed(2)}</p>
                            </div>
                            <Button
                                size="lg"
                                radius="md"
                                color="primary"
                                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                            >
                                Checkout Now
                            </Button>
                            <div className='flex items-center gap-3'>
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="primary"
                                    className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                    onPress={onCartClose}
                                >
                                    Keep Shopping
                                </Button>
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="primary"
                                    className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                    onPress={onCartClose}
                                >
                                    View Cart
                                </Button>
                            </div>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default MobileMenu;