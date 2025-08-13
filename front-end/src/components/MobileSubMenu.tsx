import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { HeaderMegaMenu } from '@/lib/config/header.config';
// import InputField from "./InputField";
import { SearchIcon } from "./Icons";
// import Link from 'next/link';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// import { Form } from '@/components/ui/Form';
// import { SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { getMailSubscriptionSettings } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { Button } from '@nextui-org/button';

// Extended type for menu items with additional properties
interface ExtendedHeaderMegaMenu extends Omit<HeaderMegaMenu, 'entity_data' | 'hide_mobile_view' | 'hide_desktop_view'> {
    is_new?: boolean;
    is_hot?: boolean;
    show_all?: boolean;
    hide_mobile_view?: boolean;
    hide_desktop_view?: boolean;
    entity_data?: HeaderMegaMenu['entity_data'] & {
        image_url?: string;
    };
}

interface MobileSubMenuProps {
    menuItems: HeaderMegaMenu[];
}

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({ menuItems }) => {
    const router = useRouter();
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Platform detection
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Debug: Log the received menu items
    console.log('MobileSubMenu received menuItems:', menuItems);

    // Filter menu items based on platform visibility
    const filterByPlatform = useCallback((items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
        return items.filter(item => {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform-specific visibility
            if (isMobile && extendedItem.hide_mobile_view) {
                return false;
            }
            if (!isMobile && extendedItem.hide_desktop_view) {
                return false;
            }
            
            // Recursively filter children
            if (item.children && item.children.length > 0) {
                const filteredChildren = filterByPlatform(item.children);
                item.children = filteredChildren;
            }
            
            return true;
        });
    }, [isMobile]);

    // Apply platform filtering to menu items
    const platformFilteredMenuItems = useMemo(() => {
        return filterByPlatform([...menuItems]);
    }, [menuItems, filterByPlatform]);

    // Fetch subscription settings
    useEffect(() => {
        const fetchSubscriptionSettings = async () => {
            const response = await getMailSubscriptionSettings();
            
            if (response.status === ServerActionStatus.SUCCESS) {
                // Settings fetched successfully, but not used in current implementation
                console.log('Subscription settings loaded');
            }
        };

        fetchSubscriptionSettings();
    }, []);

    // Recursive function to get all menu items - wrapped in useCallback to fix dependency
    const getAllMenuItems = useCallback((items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
        let allItems: HeaderMegaMenu[] = [];
        for (const item of items) {
            allItems.push(item);
            if (item.children && item.children.length > 0) {
                allItems = allItems.concat(getAllMenuItems(item.children));
            }
        }
        return allItems;
    }, []);

    // Helper: Recursively check if any menu item or its children have is_new or is_hot flags
    const hasAnyFlag = (item: HeaderMegaMenu, flag: 'is_new' | 'is_hot'): boolean => {
        // Check current item
        const extendedItem = item as ExtendedHeaderMegaMenu;
        if (extendedItem[flag]) return true;
        
        // Check children recursively
        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                if (hasAnyFlag(child, flag)) return true;
            }
        }
        
        return false;
    };

    // Helper function to get image URL (matching MegaMenu logic)
    const getImageUrl = (item: HeaderMegaMenu): string => {
        const extendedItem = item as ExtendedHeaderMegaMenu;
        
        // Deal case
        if (item.entity_type === 'deal' && extendedItem.entity_data?.image_url) {
            return extendedItem.entity_data.image_url;
        }
        
        // Product case
        if (
            item.entity_type === 'product' &&
            Array.isArray(item.entity_data?.ProductImages) &&
            item.entity_data.ProductImages.length > 0 &&
            item.entity_data.ProductImages[0]?.image_url
        ) {
            return item.entity_data.ProductImages[0].image_url;
        }
        
        return '/images/no-image.png';
    };

    // Filter product items with images - updated to match MegaMenu logic
    const productItems = useMemo(() => {
        const allItems = getAllMenuItems(platformFilteredMenuItems);
        const itemsWithImages = allItems.filter(item => {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform visibility first
            if (isMobile && extendedItem.hide_mobile_view) return false;
            if (!isMobile && extendedItem.hide_desktop_view) return false;
            
            return item.show_image && item.entity_data;
        });

        // Check if any item has show_all flag
        const hasShowAll = itemsWithImages.some(item => (item as ExtendedHeaderMegaMenu).show_all);
        
        // Collect all valid images (matching MegaMenu logic)
        const validImageItems = itemsWithImages.filter(item => {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Deal case
            if (item.entity_type === 'deal' && extendedItem.entity_data?.image_url) {
                return true;
            }
            
            // Product case
            if (
                item.entity_type === 'product' &&
                Array.isArray(item.entity_data?.ProductImages) &&
                item.entity_data.ProductImages.length > 0 &&
                item.entity_data.ProductImages[0]?.image_url
            ) {
                return true;
            }
            
            return false;
        });
        
        if (hasShowAll) {
            // If show_all is true, return all items with images
            return validImageItems;
        } else {
            // Otherwise, limit to 3 items
            return validImageItems.slice(0, 3);
        }
    }, [platformFilteredMenuItems, getAllMenuItems, isMobile]);

    // Filter menu items based on search keyword
    const filteredMenuItems = useMemo(() => {
        if (!searchKeyword.trim()) {
            return platformFilteredMenuItems;
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

        return filterItems([...platformFilteredMenuItems]); // Create a copy to avoid mutating original
    }, [platformFilteredMenuItems, searchKeyword]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
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

    // Render a single menu item with its children (recursive)
    const renderMenuItem = (menuItem: HeaderMegaMenu, level = 0) => {
        const visibleChildren = menuItem.children && menuItem.children.length > 0 
            ? menuItem.children.filter(child => !child.hide_text) 
            : [];

        // Check if any item in this tree has the flags
        const hasHotFlag = hasAnyFlag(menuItem, 'is_hot');
        const extendedMenuItem = menuItem as ExtendedHeaderMegaMenu;

        return (
            <div key={menuItem.id} className="mb-3">
                {/* If item has visible children, show as header and render children */}
                {visibleChildren.length > 0 ? (
                    <>
                        <div className={`${level > 0 ? 'border-b border-skin-neutral-200' : ''} mb-2 pb-2`}>
                            <div className="flex items-center gap-2">
                                <h3 
                                    className={`text-title-2 font-bold text-skin-neutral-500 ${menuItem.original && menuItem.original !== '#' ? 'cursor-pointer hover:underline' : ''}`}
                                    onClick={() => {
                                        if (menuItem.original && menuItem.original !== '#') {
                                            // Extract slug from original URL or entity_data
                                            let slug = '';
                                            if (menuItem.entity_type === 'brand' || menuItem.entity_type === 'deal') {
                                                slug = menuItem.entity_data?.slug || menuItem.original.split('/').pop() || '';
                                            }
                                            handleMenuClick(menuItem.original, menuItem.entity_type, slug);
                                        }
                                    }}
                                >
                                    {menuItem.label}
                                </h3>
                                {/* New tag */}
                                {extendedMenuItem.is_new && (                      
                                    <span className="bg-gradient-to-r from-[#001137] to-[#042A82] text-white text-xs px-2 py-0.5 rounded-md font-medium">
                                        New
                                    </span>
                                )}
                                {/* Hot tag */}
                                {hasHotFlag && (
                                    <span className="bg-gradient-to-r from-[#A90000] to-[#F80101] text-white text-xs px-2 py-0.5 rounded-md font-medium">
                                        Hot
                                    </span>
                                )}
                            </div>
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
                        onClick={() => {
                            // Extract slug from original URL or entity_data
                            let slug = '';
                            if (menuItem.entity_type === 'brand' || menuItem.entity_type === 'deal') {
                                slug = menuItem.entity_data?.slug || menuItem.original?.split('/').pop() || '';
                            }
                            handleMenuClick(menuItem.original, menuItem.entity_type, slug);
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span>{menuItem.label}</span>
                            {/* New tag */}
                            {extendedMenuItem.is_new && (                      
                                <span className="bg-gradient-to-r from-[#001137] to-[#042A82] text-white text-xs px-2 py-0.5 rounded-md font-medium">
                                    New
                                </span>
                            )}
                            {/* Hot tag */}
                            {extendedMenuItem.is_hot && (
                                <span className="bg-gradient-to-r from-[#A90000] to-[#F80101] text-white text-xs px-2 py-0.5 rounded-md font-medium">
                                    Hot
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='flex flex-col gap-4'>
            {/* Dynamic Product Images */}
            {productItems.length > 0 && (
                <>
                    {productItems.length > 3 ? (
                        // Slider for more than 3 images
                        <div className="relative">
                            <div className="overflow-hidden rounded-lg">
                                <div 
                                    className="flex transition-transform duration-300 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {Array.from({ length: Math.ceil(productItems.length / 2) }, (_, slideIndex) => {
                                        const firstProduct = productItems[slideIndex * 2];
                                        const secondProduct = productItems[slideIndex * 2 + 1];
                                        
                                        return (
                                            <div key={slideIndex} className="w-full flex-shrink-0">
                                                <div className="grid grid-cols-2 gap-3.5 px-2">
                                                    {firstProduct && (
                                                         <div 
                                                             className="block cursor-pointer"
                                                             onClick={() => {
                                                                 // Extract slug from original URL or entity_data
                                                                 let slug = '';
                                                                 if (firstProduct.entity_type === 'brand' || firstProduct.entity_type === 'deal') {
                                                                     slug = firstProduct.entity_data?.slug || firstProduct.original?.split('/').pop() || '';
                                                                 }
                                                                 handleMenuClick(firstProduct.original, firstProduct.entity_type, slug);
                                                             }}
                                                         >
                                                             <div className="relative overflow-hidden rounded-lg">
                                                                 <Image
                                                                     src={getImageUrl(firstProduct)}
                                                                     alt={firstProduct.entity_data?.name || firstProduct.label}
                                                                     width={183}
                                                                     height={130}
                                                                     className="w-full h-32 object-contain transition-transform hover:scale-105 rounded-10"
                                                                 />
                                                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                                     <h4 className="text-white text-xs font-semibold truncate">
                                                                         {firstProduct.entity_data?.name || firstProduct.label}
                                                                     </h4>
                                                                     {firstProduct.entity_data?.price && (
                                                                         <p className="text-white/90 text-xs">
                                                                             £{firstProduct.entity_data.price}
                                                                         </p>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     )}
                                                     {secondProduct && (
                                                         <div 
                                                             className="block cursor-pointer"
                                                             onClick={() => {
                                                                 // Extract slug from original URL or entity_data
                                                                 let slug = '';
                                                                 if (secondProduct.entity_type === 'brand' || secondProduct.entity_type === 'deal') {
                                                                     slug = secondProduct.entity_data?.slug || secondProduct.original?.split('/').pop() || '';
                                                                 }
                                                                 handleMenuClick(secondProduct.original, secondProduct.entity_type, slug);
                                                             }}
                                                         >
                                                             <div className="relative overflow-hidden rounded-lg">
                                                                 <Image
                                                                     src={getImageUrl(secondProduct)}
                                                                     alt={secondProduct.entity_data?.name || secondProduct.label}
                                                                     width={183}
                                                                     height={130}
                                                                     className="w-full h-32 object-contain transition-transform hover:scale-105 rounded-10"
                                                                 />
                                                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                                     <h4 className="text-white text-xs font-semibold truncate">
                                                                         {secondProduct.entity_data?.name || secondProduct.label}
                                                                     </h4>
                                                                     {secondProduct.entity_data?.price && (
                                                                         <p className="text-white/90 text-xs">
                                                                             £{secondProduct.entity_data.price}
                                                                         </p>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Slider Navigation */}
                            {productItems.length > 2 && (
                                <div className="flex justify-center mt-4 space-x-2">
                                    {Array.from({ length: Math.ceil(productItems.length / 2) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                currentSlide === i ? 'bg-skin-primary' : 'bg-skin-neutral-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Grid layout for 3 or fewer images
                        <div className="grid grid-cols-3 gap-3.5">
                            {productItems.map(product => (
                                <div 
                                    key={product.id} 
                                    className="block cursor-pointer"
                                    onClick={() => {
                                        // Extract slug from original URL or entity_data
                                        let slug = '';
                                        if (product.entity_type === 'brand' || product.entity_type === 'deal') {
                                            slug = product.entity_data?.slug || product.original?.split('/').pop() || '';
                                        }
                                        handleMenuClick(product.original, product.entity_type, slug);
                                    }}
                                >
                                    <div className="relative overflow-hidden rounded-lg">
                                        <Image
                                            src={getImageUrl(product)}
                                            alt={product.entity_data?.name || product.label}
                                            width={183}
                                            height={130}
                                            className="w-full h-32 object-contain transition-transform hover:scale-105 rounded-10"
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
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            
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
            {/* <div className='p-4.5 bg-subscription-banner-mob bg-no-repeat bg-top rounded-lg bg-cover space-y-4 w-full'>
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
            </div> */}
        </div>
    )
}

export default MobileSubMenu;
