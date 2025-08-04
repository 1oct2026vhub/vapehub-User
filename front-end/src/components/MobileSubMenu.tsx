import Image from 'next/image';
import React from 'react';
import { HeaderMegaMenu } from '@/lib/config/header.config';
import InputField from "./InputField";
import { SearchIcon } from "./Icons";
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/Form';
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { subscribeMail, getMailSubscriptionSettings } from '@/lib/server.actions';
import { ServerActionStatus, DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';

interface MobileSubMenuProps {
    menuItems: HeaderMegaMenu[];
}

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({ menuItems }) => {
    const router = useRouter();
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [discountAmount, setDiscountAmount] = useState('10');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

    // Debug: Log the received menu items
    console.log('MobileSubMenu received menuItems:', menuItems);

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

    // Subscription form configuration
    const subscribeFromConfig = useForm<SubscribeFormSchema>({
        resolver: zodResolver(SUBSCRIBE_IN_SCHEMA),
        mode: 'onSubmit',
    });

    // Handle subscription form submit
    const handleFormSubmit = async ({ email }: SubscribeFormSchema) => {
        const response = await subscribeMail(email);
        if (response.status === ServerActionStatus.ERROR) {
            toast.error(response.message);
            return;
        }
        toast.success("You have successfully subscribed");
        subscribeFromConfig.reset({ email: '' });
    };

    // Format discount display based on type
    const formatDiscount = () => {
        if (discountType === 'percentage') {
            return `${discountAmount}%`;
        }
        return `${DEFAULT_CURRENCY_SYMBOL}${discountAmount}`;
    };

    // Recursive function to get all menu items
    const getAllMenuItems = (items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
        let allItems: HeaderMegaMenu[] = [];
        for (const item of items) {
            allItems.push(item);
            if (item.children && item.children.length > 0) {
                allItems = allItems.concat(getAllMenuItems(item.children));
            }
        }
        return allItems;
    };

    // Filter product items with images
    const productItems = useMemo(() => {
        const allItems = getAllMenuItems(menuItems);
        return allItems.filter(item =>
            item.entity_type === 'product' &&
            item.show_image &&
            item.entity_data &&
            item.entity_data.ProductImages &&
            item.entity_data.ProductImages.length > 0
        ).slice(0, 3);
    }, [menuItems]);

    // Filter menu items based on search keyword
    const filteredMenuItems = useMemo(() => {
        if (!searchKeyword.trim()) {
            return menuItems;
        }

        const keyword = searchKeyword.toLowerCase().trim();
        
        // Recursive function to filter menu items
        const filterItems = (items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
            return items.filter(item => {
                // Check if current item matches
                const itemMatches = item.label.toLowerCase().includes(keyword);
                
                // Check if any children match
                let childrenMatch = false;
                if (item.children && item.children.length > 0) {
                    const filteredChildren = filterItems(item.children);
                    childrenMatch = filteredChildren.length > 0;
                    
                    // Update children with filtered results
                    if (childrenMatch) {
                        item.children = filteredChildren;
                    }
                }
                
                // Return true if either the item or its children match
                return itemMatches || childrenMatch;
            });
        };

        return filterItems([...menuItems]); // Create a copy to avoid mutating original
    }, [menuItems, searchKeyword]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
    };

    // Handle menu item click navigation
    const handleMenuClick = (original: string | null) => {
        if (original && original !== '#') {
            router.push(original);
        }
    };

    // Render a single menu item with its children (recursive)
    const renderMenuItem = (menuItem: HeaderMegaMenu, level = 0) => {
        const visibleChildren = menuItem.children && menuItem.children.length > 0 
            ? menuItem.children.filter(child => !child.hide_text) 
            : [];

        return (
            <div key={menuItem.id} className="mb-3">
                {/* If item has visible children, show as header and render children */}
                {visibleChildren.length > 0 ? (
                    <>
                        <div className={`${level > 0 ? 'border-b border-skin-neutral-200' : ''} mb-2 pb-2`}>
                            <h3 
                                className={`text-title-2 font-bold text-skin-neutral-500 ${menuItem.original && menuItem.original !== '#' ? 'cursor-pointer hover:underline' : ''}`}
                                onClick={() => menuItem.original && menuItem.original !== '#' && handleMenuClick(menuItem.original)}
                            >
                                {menuItem.label}
                            </h3>
                        </div>
                        <div className="pl-4 space-y-2">
                            {visibleChildren.map((child) => (
                                <div key={child.id} className="pl-3">
                                    {renderMenuItem(child, level + 1)}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* If item has no visible children, show as a link */
                    <div 
                        className="block py-1 text-skin-neutral-300 font-normal text-content-1 leading-none hover:underline cursor-pointer"
                        onClick={() => handleMenuClick(menuItem.original)}
                    >
                        {menuItem.label}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='flex flex-col gap-4'>
            {/* Dynamic Product Images */}
            <div className="grid grid-cols-2 gap-3.5">
                {productItems.map(product => (
                    <Link href={product.original || '#'} key={product.id} className="block">
                        <div className="relative overflow-hidden rounded-lg">
                            <Image
                                src={product.entity_data?.ProductImages?.[0]?.image_url || '/images/no-image.png'}
                                alt={product.entity_data?.name || product.label}
                                width={183}
                                height={130}
                                className="w-full h-32 object-cover transition-transform hover:scale-105 rounded-10"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <h4 className="text-white text-xs font-semibold truncate">
                                    {product.entity_data?.name || product.label}
                                </h4>
                                {product.entity_data?.price && (
                                    <p className="text-white/90 text-xs">
                                        £{product.entity_data.price}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
                {/* Placeholder images if not enough product images */}
                {productItems.length < 3 && Array.from({ length: 3 - productItems.length }).map((_, i) => (
                    <div key={`placeholder-${i}`} className="relative overflow-hidden rounded-lg bg-gray-100">
                        <div className="h-32 flex items-center justify-center rounded-10">
                            <div className="text-center">
                                <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-xs">No Image Available</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Search Input */}
            <div className="w-full">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-3 pl-12 text-content-2 font-bold border border-skin-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skin-primary focus:border-transparent"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-max md:h-max text-skin-neutral-400" />
                </div>
            </div>
            
            {/* Menu items in hierarchical structure */}
            <div className="space-y-4">
                {filteredMenuItems.map((menuItem) => (
                    <div key={menuItem.id} className="border-b border-skin-neutral-200 pb-4">
                        {renderMenuItem(menuItem)}
                    </div>
                ))}
            </div>
            
            {/* Newsletter Subscription */}
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
        </div>
    )
}

export default MobileSubMenu;
