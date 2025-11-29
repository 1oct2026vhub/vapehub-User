'use client'
import { CloseIcon, SearchIcon, ShoppingCartIcon, UserIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import Logo from "@/components/ui/Logo";
import { Button } from "@nextui-org/button";
import { Badge, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure } from "@nextui-org/react";
import Link from 'next/link';
import ShoppingCartCardDrawer from './ShoppingCartCardDrawer';
import ShippingProgress from './ShippingProgress';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema, HeaderMegaMenu } from '@/lib/config/header.config';
import { useForm, useWatch } from 'react-hook-form';
import { Form } from '@/components/ui/Form';
import MobileMenu from './MobileMenu';
import { useCart } from '@/lib/context/CartContext';
import { ROUTES } from '@/lib/routes';
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config';
import { usePathname, useRouter } from 'next/navigation';
import { Category } from '@/lib/config/category.config';
import NotificationAction from './NotificationAction';
import { useEffect, useState } from "react";
import { getProductList, getShippingMethods } from "@/lib/server.actions";
import { Product } from "@/lib/config/product.config";
import ProductSuggestions from './ProductSuggestions';
import { useDebounce } from "@/lib/hooks/useDebounce";
import { scrollToTop } from "@/lib/utils/scrollToTop";
import MobileLogo from "./ui/MobileLogo";

type Props = {
    categories: Category[];
    megaMenuData?: HeaderMegaMenu[];
}

const HeaderTopBar = ({ megaMenuData = [] }: Props) => {
    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
        defaultValues: {
            search: ''
        }
    });

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const router = useRouter();
    const pathname = usePathname();
    const { cartItems, cartTotal, itemCount, checkoutStockValidation, stockValidationLoading, cartSubtotal } = useCart();
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | undefined>(undefined);

    // Check if we're on the verification email page
    const isVerificationPage = pathname.includes('/verify-email');

    const searchTerm = useWatch({ control: searchFromConfig.control, name: 'search' });
    const debouncedSearchTerm = useDebounce(searchTerm, 150);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearchTerm && debouncedSearchTerm.length >= 1) {
                setIsSuggestionLoading(true);
                const response = await getProductList({ keyword: debouncedSearchTerm, limit: 5 });
                if (response.status === ServerActionStatus.SUCCESS) {
                    setSuggestions(response.data.products);
                } else {
                    setSuggestions([]);
                }
                setIsSuggestionLoading(false);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        };
        fetchSuggestions();
    }, [debouncedSearchTerm]);

    useEffect(() => {
        // Clear search and hide suggestions on route change
        setShowSuggestions(false);
        searchFromConfig.reset({ search: '' });
    }, [pathname]);

    useEffect(() => {
        const fetchFreeShippingThreshold = async () => {
            const response = await getShippingMethods({ is_free_shipping: true });
            if (response.status === ServerActionStatus.SUCCESS && Array.isArray(response.data)) {
                const methodWithThreshold = response.data.find((method) => {
                    const threshold = method.free_shipping_threshold ? parseFloat(method.free_shipping_threshold) : NaN;
                    return (method.is_free_shipping ?? false) && Number.isFinite(threshold) && threshold > 0;
                });

                if (methodWithThreshold?.free_shipping_threshold) {
                    const thresholdValue = parseFloat(methodWithThreshold.free_shipping_threshold);
                    if (Number.isFinite(thresholdValue) && thresholdValue > 0) {
                        setFreeShippingThreshold(thresholdValue);
                    }
                }
            }
        };

        fetchFreeShippingThreshold();
    }, []);

    const handleSearch = (data: HeaderFormSchema) => {
        if (data.search) {
            router.push(`${ROUTES.SHOP}?keyword=${data.search}`, { scroll: false });
            setShowSuggestions(false);
            searchFromConfig.reset({ search: '' });
            // Scroll to top after search
            scrollToTop();
        }
    };

    const handleViewAll = () => {
        if (searchTerm) {
            router.push(`${ROUTES.SHOP}?keyword=${searchTerm}`, { scroll: false });
            setShowSuggestions(false);
            searchFromConfig.reset({ search: '' });
            // Scroll to top after search
            scrollToTop();
        }
    }

    const handleCheckout = async () => {
        const isValid = await checkoutStockValidation();
        if (isValid) {
            onClose();
            router.push(ROUTES.CHECKOUT);

        }
    }
    return (
        <>
            <div className="hidden lg:flex items-center justify-between gap-10 max-w-[1520px] mx-auto w-full">
                <Logo className='max-xl:max-w-64' />
                {!isVerificationPage && (
                    <>
                        <div className="relative flex-1 flex-shrink justify-center items-center max-w-[650px] mx-auto search-wrapper">
                            <Form {...searchFromConfig}>
                                <form noValidate className="w-full" onSubmit={searchFromConfig.handleSubmit(handleSearch)}>
                                    <InputField
                                        control={searchFromConfig.control}
                                        name="search"
                                        type={Header_FORM_CONFIG.SEARCH.TYPE}
                                        placeholder={Header_FORM_CONFIG.SEARCH.PH}
                                        className="w-full"
                                        classNames={{
                                            input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
                                        }}
                                        startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
                                    />
                                </form>
                            </Form>
                            {showSuggestions && searchTerm && (
                                <ProductSuggestions
                                    suggestions={suggestions}
                                    isLoading={isSuggestionLoading}
                                    onViewAll={handleViewAll}
                                    onClose={() => setShowSuggestions(false)}
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-6 self-stretch">
                            <NotificationAction />
                            <Button onPress={onOpen} variant='light' className="flex items-center gap-2 hover:!bg-transparent h-fit">
                                <ShoppingCartIcon />
                                <div className="flex flex-col gap-1 text-start">
                                    <span className="capitalize text-title-1 font-bold font-oswald text-white">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                                    <span className="capitalize text-content-1 font-bold text-skin-primary-50">{DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}</span>
                                </div>
                            </Button>
                            <Link href={ROUTES.MY_ACCOUNT} className="flex items-center gap-2">
                                <UserIcon />
                                <div className="flex flex-col gap-1 text-start">
                                    <span className="capitalize text-title-1 font-bold font-oswald text-white">Welcome</span>
                                    <span className="capitalize text-content-1 font-bold text-skin-primary-50 tracking-normal">My ACCOUNT</span>
                                </div>
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Responsive screens */}

            <div className="flex flex-col space-y-3.5 lg:hidden">
                <div className="flex items-center justify-between gap-5">
                    <MobileMenu megaMenuData={megaMenuData} />
                    <MobileLogo className='ml-6' />
                    {!isVerificationPage && (
                        <div className="flex items-center gap-1">
                            <NotificationAction />
                            <Link href={ROUTES.MY_ACCOUNT}>
                                <UserIcon />
                            </Link>
                            <Badge color="default" content={itemCount} shape="circle" variant='faded' className="bg-skin-white border-[#DCDCDC] text-skin-black text-content-2 font-bold">
                                <Button isIconOnly size="sm" aria-label="more than 99 cart items" radius="full" variant="light" className='!min-w-fit !w-fit !h-fit' onPress={onOpen}>
                                    <ShoppingCartIcon />
                                </Button>
                            </Badge>
                        </div>
                    )}
                </div>
                {!isVerificationPage && (
                    <div className="relative flex flex-1 flex-shrink justify-center items-center">
                        <Form {...searchFromConfig}>
                            <form noValidate className="w-full" onSubmit={searchFromConfig.handleSubmit(handleSearch)}>
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
                        {showSuggestions && searchTerm && (
                            <ProductSuggestions
                                suggestions={suggestions}
                                isLoading={isSuggestionLoading}
                                onViewAll={handleViewAll}
                                onClose={() => setShowSuggestions(false)}
                            />
                        )}
                    </div>
                )}
            </div>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} className='filter-drawer rounded-l-32 md:!w-[637px] max-w-[90%] md:!max-w-[637px]'>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex items-center justify-between gap-1 border-b border-skin-neutral-100 py-3 md:py-6 px-4 md:px-6">
                                <h1 className='primary-gradient-600 text-xl font-semibold w-fit'>Shopping Cart</h1>
                                <Button isIconOnly variant='light' onPress={onClose} className="!h-fit !w-fit !min-w-fit">
                                    <CloseIcon />
                                </Button>
                            </DrawerHeader>
                            <DrawerBody className='max-sm:px-4'>
                                <div className='space-y-4 my-2 h-full'>
                                    {cartItems.length > 0 ? (
                                        cartItems.map((item, idx) => (
                                            <ShoppingCartCardDrawer key={idx} item={item} />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-4 py-8 my-auto h-full">
                                            <div className="bg-primary-gradient-100 rounded-lg p-3 relative">
                                                <ShoppingCartIcon className='w-20 h-20 text-black' />
                                                <span className="absolute -top-4 -right-3 w-auto min-w-10 h-auto aspect-square bg-skin-primary-300 rounded-full text-title-2 font-semibold text-white flex items-center justify-center">{itemCount}</span>
                                            </div>
                                            <p className="text-title-2 font-semibold text-skin-neutral-500 italic">Looks like you haven&apos;t added anything yet!</p>
                                            <Button as={Link} href={ROUTES.SHOP} color="primary" className="shadow-button btn primary-btn uppercase !font-oswald text-title-2 md:text-title-1" onPress={onClose}>
                                                Continue Shopping
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </DrawerBody>
                            {cartItems.length > 0 && (
                                <DrawerFooter className='flex flex-col gap-3 py-4 md:py-6 px-4 md:px-6 border-t border-skin-neutral-100'>
                                    {freeShippingThreshold !== undefined && (
                                        <>

                                            <ShippingProgress totalAmount={cartTotal} freeShippingThreshold={freeShippingThreshold} />
                                        </>
                                    )}
                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between text-black font-semibold'>
                                            <p className='text-content-2 md:text-title-1'>Total</p>
                                            <div className="text-right">
                                                <p className='text-title-2 md:text-h5'>{DEFAULT_CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</p>
                                                {cartTotal !== cartSubtotal && (
                                                    <p className="text-skin-neutral-300 text-content-3 md:text-title-2 line-through opacity-60 font-bold">
                                                        {DEFAULT_CURRENCY_SYMBOL}{cartSubtotal.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            radius="md"
                                            color="primary"
                                            className="w-full btn primary-btn shadow-button !text-skin-white !rounded text-title-1 md:text-h5 !font-semibold !py-4 !px-6"
                                            onPress={handleCheckout}
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
                                                className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-xl !py-4 !px-6 max-md:!h-9.5"
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
                                                className="w-full bg-skin-neutral-500 shadow-button !text-skin-white !rounded-10 text-content-1 md:text-xl !py-4 !px-6 max-md:!h-9.5"
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
