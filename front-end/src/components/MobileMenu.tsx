'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Accordion, AccordionItem, Badge, Divider } from '@nextui-org/react';
import { CloseIcon, DownArrowFilledIcon, MenuIcon, ShoppingCartIcon, UserIcon } from '@/components/Icons';
import Logo from './ui/Logo';
import Link from 'next/link';
import ShoppingCartCardDrawer from './ShoppingCartCardDrawer';
import ShippingProgress from './ShippingProgress';
import InputField from '@/components/InputField'
import { Form } from '@/components/ui/Form';
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config';
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { subscribeMail, getMailSubscriptionSettings } from '@/lib/server.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import MobileSubMenu from './MobileSubMenu';
import { useCart } from '@/lib/context/CartContext';
import { ROUTES } from '@/lib/routes';
import { useRouter, usePathname } from 'next/navigation';
import { defaultNavLinks } from '@/lib/config/category.config';
import { HeaderMegaMenu } from '@/lib/config/header.config';

type Props = {
    megaMenuData?: HeaderMegaMenu[];
}

const MobileMenu = ({ megaMenuData = [] }: Props) => {
    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
    const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [isFooterVisible, setFooterVisible] = useState(true);
    const [discountAmount, setDiscountAmount] = useState('10');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const { cartItems, cartTotal, itemCount, checkoutStockValidation, stockValidationLoading } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    
    // Check if we're on the verification email page
    const isVerificationPage = pathname.includes('/verify-email');
    
    // Fetch subscription settings
    useEffect(() => {
        const fetchSubscriptionSettings = async () => {
            const response = await getMailSubscriptionSettings();
            
            if (response.status === ServerActionStatus.SUCCESS) {
                const { discount_amount, discount_type } = response.data;
                
                // Validate and set discount type
                const validDiscountType = discount_type === 'fixed' ? 'fixed' : 'percentage';
                setDiscountType(validDiscountType);

                // Round the discount amount to the nearest whole number
                const roundedDiscount = Math.round(parseFloat(discount_amount)).toString();
                setDiscountAmount(roundedDiscount);
            }
        };

        fetchSubscriptionSettings();
    }, []);
    
    const itemClasses = {
        base: "w-full rounded-lg shadow-input border border-skin-neutral-100",
        title: "text-title-2 font-bold uppercase",
        trigger: '!py-2.5',
        indicator: "text-medium text-skin-neutral-50 data-[open=true]:rotate-180",
        content: "py-4 border-t border-skin-neutral-200",
    };

    // Use megaMenuData if available, otherwise fall back to categories
    const menuData = megaMenuData.length > 0 ? megaMenuData : [];

    // Check if there are any menu items with children or images
    const hasMenuContent = menuData.some(menuItem => 
        (menuItem.children && menuItem.children.length > 0) || 
        (menuItem.show_image && menuItem.entity_data)
    );

    const filterOptions = menuData.length > 0 ? menuData.slice(0, 8).map((menuItem) => ({
        title: menuItem.label,
        content: <MobileSubMenu menuItems={menuItem.children || []} />,
        link: menuItem.original || '#',
        isLink: false,
    })) : [];

    // Format discount display based on type
    const formatDiscount = () => {
        if (discountType === 'percentage') {
            return `${discountAmount}%`;
        }
        return `${DEFAULT_CURRENCY_SYMBOL}${discountAmount}`;
    };

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

    const handleCheckout = async () => {
        const isValid = await checkoutStockValidation();
        if (isValid) {
            router.push(ROUTES.CHECKOUT);
            onCartClose();
        }
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

    // Handle menu item click navigation
    const handleMenuClick = (original: string | null, entityType?: string, slug?: string) => {
        if (original && original !== '#') {
            // Handle different entity types with custom navigation
            if (entityType === 'brand' && slug) {
                router.push(`/brand/${slug}`);
            } else if (entityType === 'deal' && slug) {
                router.push(`/product-deals/${slug}`);
            } else {
                router.push(original);
            }
        }
    };


    return (
        <div>
            <div
                typeof='button'
                onClick={onMenuOpen}
            >
                {<MenuIcon className='z-10 relative' />}
            </div>
            <Drawer isOpen={isMenuOpen} onOpenChange={handleMenuClose} placement='bottom' className='max-h-[95vh] min-h-[95vh] rounded-t-32' classNames={{
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
                            {!isVerificationPage && (
                                <>
                                    <Link href={ROUTES.MY_ACCOUNT} onClick={handleMenuClose}>
                                        <UserIcon />
                                    </Link>
                                    <Badge color="default" content={itemCount} shape="circle" variant='faded' className="bg-skin-white border-[#DCDCDC] text-skin-black text-content-2 font-bold">
                                        <Button isIconOnly size="sm" aria-label="more than 99 cart items" radius="full" variant="light" onPress={onCartOpen}>
                                            <ShoppingCartIcon />
                                        </Button>
                                    </Badge>
                                </>
                            )}
                        </div>
                    </DrawerHeader>
                    <DrawerBody className='py-4 px-4'>
                        {/* Accordion Filters */}
                        {hasMenuContent && (
                            <Accordion variant="splitted" className="!p-0" itemClasses={itemClasses} selectionMode='multiple'>
                                {filterOptions.map(({ title, content, link }, index) => {
                                    // Check if this specific menu item has children or images
                                    const menuItem = menuData[index];
                                    const hasSubContent = menuItem && (
                                        (menuItem.children && menuItem.children.length > 0) || 
                                        (menuItem.show_image && menuItem.entity_data)
                                    );
                                    
                                    return (
                                        <AccordionItem
                                            key={title}
                                            aria-label={title}
                                            title={
                                                menuItem && (menuItem.entity_type === 'brand' || menuItem.entity_type === 'deal') ? (
                                                    <button
                                                        className="w-full text-left"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            // Extract slug from original URL or entity_data
                                                            let slug = '';
                                                            if (menuItem.entity_type === 'brand' || menuItem.entity_type === 'deal') {
                                                                slug = menuItem.entity_data?.slug || menuItem.original?.split('/').pop() || '';
                                                            }
                                                            handleMenuClick(menuItem.original, menuItem.entity_type, slug);
                                                        }}
                                                    >
                                                        {title}
                                                    </button>
                                                ) : (
                                                    <Link href={link} key={title} scroll={true}>
                                                        {title}
                                                    </Link>
                                                )
                                            }
                                            indicator={hasSubContent ? <DownArrowFilledIcon color='black' /> : null}
                                            onPress={hasSubContent ? () => handleAccordionItemClick(index) : undefined}
                                        >
                                            {hasSubContent ? content : null}
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                        {defaultNavLinks.map(({ name, slug }) => (
                            <Button as={Link} href={slug} key={name} variant='light' className='w-full justify-start text-title-2 font-bold p-3'
                                onPress={handleMenuClose}>
                                {name}
                            </Button>
                            
                        ))}
                    </DrawerBody>
                    {isFooterVisible && openItems.length === 0 && (
                        <DrawerFooter className='py-4 px-4 space-y-6 flex-col border-t border-skin-neutral-200 max-lg:landscape:hidden'>
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
                                            Subscribe & Save {formatDiscount()}
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

            {!isVerificationPage && (
                <Drawer isOpen={isCartOpen} onOpenChange={onCartClose} className='filter-drawer rounded-l-32 md:!w-[637px] max-w-[90%] md:!max-w-[637px]'>
                    <DrawerContent>
                        <DrawerHeader className="flex flex-col gap-1 border-b border-skin-neutral-100">
                            <h1 className='primary-gradient-600 text-title-1 font-bold w-fit'>Shopping Cart</h1>
                        </DrawerHeader>
                        <DrawerBody className='max-sm:px-4'>
                            <div className='space-y-5 my-3'>
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, idx) => (
                                        <ShoppingCartCardDrawer key={idx} item={item} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                                        <p className="text-content-2 text-skin-neutral-500">Your cart is empty</p>
                                        <Button as={Link} href={ROUTES.SHOP} color="primary" className="shadow-button">
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
                                        onPress={handleCheckout}
                                        size="lg"
                                        radius="md"
                                        color="primary"
                                        className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                                        isLoading={stockValidationLoading}
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
                                        >
                                            View Cart
                                        </Button>
                                    </div>
                                </div>
                            </DrawerFooter>
                        )}
                    </DrawerContent>
                </Drawer>
            )}
        </div>
    );
};

export default MobileMenu;