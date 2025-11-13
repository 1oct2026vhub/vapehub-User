import Image from 'next/image';
import React, { useState } from 'react';
import { HeaderMegaMenu } from '@/lib/config/header.config';
import Slider from "react-slick";
// import InputField from "./InputField";
import { SearchIcon } from "./Icons";
// import Link from 'next/link';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// import { Form } from '@/components/ui/Form';
// import { SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
// import { useSubscription } from '@/lib/context/SubscriptionContext';
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
    image_url?: string | null; // image_url is now provided at top level by API
    entity_data?: HeaderMegaMenu['entity_data'] & {
        image_url?: string;
    };
}

interface MobileSubMenuProps {
    menuItems: HeaderMegaMenu[];
    parentMenu?: HeaderMegaMenu | null;
}

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({ menuItems, parentMenu }) => {
    const router = useRouter();
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    // const { subscriptionSettings } = useSubscription();

    // Platform detection
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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

    // Note: Subscription settings are now available via useSubscription hook

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

    // Helper: Recursively collect all menu items with image_url at top level (matching MegaMenu logic)
    const collectAllImageItems = useCallback((items: HeaderMegaMenu[]): { item: HeaderMegaMenu, imageUrl: string }[] => {
        let result: { item: HeaderMegaMenu, imageUrl: string }[] = [];
        for (const item of items) {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform visibility first
            if (isMobile && extendedItem.hide_mobile_view) continue;
            if (!isMobile && extendedItem.hide_desktop_view) continue;
            
            // Check for image_url at top level (now provided directly by API) - matching MegaMenu
            if (extendedItem.image_url && typeof extendedItem.image_url === 'string' && extendedItem.image_url.trim() !== '') {
                result.push({ item, imageUrl: extendedItem.image_url });
            }
            
            // Recursively check children
            if (item.children) {
                result = result.concat(collectAllImageItems(item.children));
            }
        }
        return result;
    }, [isMobile]);

    // Collect all image items from menu items (matching MegaMenu logic)
    const allImageResults = useMemo(() => {
        return collectAllImageItems(platformFilteredMenuItems);
    }, [platformFilteredMenuItems, collectAllImageItems]);

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

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
    };

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

    // Get parent menu image if available
    const parentMenuExtended = parentMenu as ExtendedHeaderMegaMenu | undefined;
    const parentMenuImageUrl = parentMenuExtended?.image_url;

    // Combine parent menu image with all submenu images for slider (matching MegaMenu logic)
    const allSliderItems = useMemo(() => {
        const items: Array<{ id: string | number; imageUrl: string; label: string; original: string | null; entityType?: string; slug?: string; price?: string }> = [];
        
        // Add parent menu image first if available
        if (parentMenuImageUrl && parentMenu) {
            items.push({
                id: `parent-${parentMenu.id}`,
                imageUrl: parentMenuImageUrl,
                label: parentMenu.label,
                original: parentMenu.original,
                entityType: parentMenu.entity_type,
                slug: parentMenu.entity_type === 'brand' || parentMenu.entity_type === 'deal' 
                    ? (parentMenu.entity_data?.slug || parentMenu.original?.split('/').pop() || '')
                    : undefined
            });
        }
        
        // Add all submenu items with image_url (matching MegaMenu logic)
        allImageResults.forEach(({ item, imageUrl }) => {
            items.push({
                id: item.id,
                imageUrl: imageUrl,
                label: item.entity_data?.name || item.label,
                original: item.original,
                entityType: item.entity_type,
                slug: item.entity_type === 'brand' || item.entity_type === 'deal'
                    ? (item.entity_data?.slug || item.original?.split('/').pop() || '')
                    : undefined,
                price: item.entity_data?.price
            });
        });
        
        return items;
    }, [parentMenuImageUrl, parentMenu, allImageResults]);

    return (
        <div className='flex flex-col gap-4'>
            {/* Dynamic Product Images with Parent Menu Image */}
            {allSliderItems.length > 0 && (
                <div className="relative">
                    <Slider {...settings}>
                        {allSliderItems.map(item => (
                            <div
                                key={item.id}
                                className="block cursor-pointer px-2"
                                onClick={() => {
                                    handleMenuClick(item.original, item.entityType, item.slug);
                                }}
                            >
                                <div className="relative overflow-hidden rounded-lg">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.label}
                                        width={183}
                                        height={130}
                                        className="w-full h-32 object-contain transition-transform hover:scale-105 rounded-10"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <h4 className="text-white text-xs font-semibold truncate">
                                            {item.label}
                                        </h4>
                                        {item.price && (
                                            <p className="text-white/90 text-xs">
                                                £{item.price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
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
