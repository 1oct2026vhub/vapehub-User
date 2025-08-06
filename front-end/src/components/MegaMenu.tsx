import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema, HeaderMegaMenu } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import InputField from "./InputField";
import { SearchIcon } from "./Icons";
import { Form } from '@/components/ui/Form';
import Image from "next/image";
import Link from 'next/link';
import { useMemo, useState, useCallback } from 'react';
// import { getAllDeals } from '@/lib/server.actions';
// import { ServerActionStatus } from '@/lib/config/app.config';
// import { Deal } from '@/lib/config/deal.config';
import { useRouter } from 'next/navigation';

// Extended type for menu items with additional properties
interface ExtendedHeaderMegaMenu extends Omit<HeaderMegaMenu, 'entity_data'> {
    is_new?: boolean;
    is_hot?: boolean;
    entity_data?: HeaderMegaMenu['entity_data'] & {
        image_url?: string;
    };
}

export const MegaMenu: React.FC<{ isOpen: boolean; menuItems: HeaderMegaMenu[] }> = ({ isOpen, menuItems }) => {
    const router = useRouter();
    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const [searchKeyword, setSearchKeyword] = useState<string>('');

    // Recursive function to get all menu items - memoized with useCallback
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

    // Helper: Recursively check if any menu item or its children have is_new or is_hot flags
    const hasAnyFlag = useCallback((item: HeaderMegaMenu, flag: 'is_new' | 'is_hot'): boolean => {
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
    }, []);

    // Render a single menu item with its children
    const renderMenuItem = (menuItem: HeaderMegaMenu, level = 0) => {
        const visibleChildren = menuItem.children && menuItem.children.length > 0 
            ? menuItem.children.filter(child => !child.hide_text) 
            : [];

        // Check if any item in this tree has the flags
        const hasHotFlag = hasAnyFlag(menuItem, 'is_hot');
        const extendedMenuItem = menuItem as ExtendedHeaderMegaMenu;

        return (
            <div key={menuItem.id} className={`${shouldShowImageSection ? 'mb-4' : 'mb-2'}`}>
                {/* If item has visible children, show as header and render children */}
                {visibleChildren.length > 0 ? (
                    <>
                        <div className={`${level > 0 ? 'border-b border-skin-neutral-200' : ''} ${shouldShowImageSection ? 'mb-2 pb-2' : 'mb-1 pb-1'}`}>
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
                        <div className={`pl-4 ${shouldShowImageSection ? 'space-y-2' : 'space-y-1'}`}>
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
                        className={`block ${shouldShowImageSection ? 'py-1' : 'py-0.5'} text-skin-neutral-300 font-normal text-content-1 leading-none hover:underline cursor-pointer`}
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

    // Render menu items in columns with overflow handling
    const renderMenuColumns = (items: HeaderMegaMenu[]) => {
        const visibleItems = items.filter(item => !item.hide_text);
        if (visibleItems.length === 0) return null;

        // Check if any items have children
        const hasChildren = visibleItems.some(item => item.children && item.children.length > 0);

        if (hasChildren) {
            // When items have children, always use 3 columns to display main menus as titles
            const firstRowItems = visibleItems.slice(0, 3);
            const remainingItems = visibleItems.slice(3);

            return (
                <div className="space-y-6">
                    {/* First row with 3 columns */}
                    <div className="grid grid-cols-3 gap-8">
                        {Array.from({ length: 3 }, (_, colIdx) => (
                            <div key={colIdx} className="space-y-4">
                                {firstRowItems[colIdx] && renderMenuItem(firstRowItems[colIdx])}
                            </div>
                        ))}
                    </div>
                    
                    {/* Border bottom after first row if there are more items */}
                    {remainingItems.length > 0 && (
                        <div className="border-b border-skin-neutral-200 pb-6"></div>
                    )}
                    
                    {/* Remaining items in 3 columns */}
                    {remainingItems.length > 0 && (
                        <div className="grid grid-cols-3 gap-8">
                            {Array.from({ length: 3 }, (_, colIdx) => (
                                <div key={colIdx} className="space-y-4">
                                    {remainingItems.filter((_, idx) => idx % 3 === colIdx).map(item => renderMenuItem(item))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        } else {
            // When no child items, use dynamic columns based on image section
            if (!shouldShowImageSection) {
                // Dynamic column count based on item count for no image section
                let columnCount = 1;
                if (visibleItems.length >= 7) {
                    columnCount = 3;
                } else if (visibleItems.length >= 4) {
                    columnCount = 2;
                } else {
                    columnCount = 1;
                }

                return (
                    <div className={`grid grid-cols-${columnCount} gap-8`}>
                        {Array.from({ length: columnCount }, (_, colIdx) => (
                            <div key={colIdx} className="space-y-3">
                                {visibleItems.filter((_, idx) => idx % columnCount === colIdx).map(item => renderMenuItem(item))}
                            </div>
                        ))}
                    </div>
                );
            } else {
                // For image section: use 2 columns to maximize space
                return (
                    <div className="grid grid-cols-2 gap-6">
                        {Array.from({ length: 2 }, (_, colIdx) => (
                            <div key={colIdx} className="space-y-3">
                                {visibleItems.filter((_, idx) => idx % 2 === colIdx).map(item => renderMenuItem(item))}
                            </div>
                        ))}
                    </div>
                );
            }
        }
    };

    // Remove old productItems logic and add recursive helpers

    // Helper: Recursively check if any menu item (or its children) has show_image: true
    const hasAnyShowImage = useCallback((items: HeaderMegaMenu[]): boolean => {
        for (const item of items) {
            if (item.show_image) return true;
            if (item.children && hasAnyShowImage(item.children)) return true;
        }
        return false;
    }, []);

    // Helper: Recursively find the first menu item with show_image: true and a valid image (deal or product)
    const findFirstImageItem = useCallback((items: HeaderMegaMenu[]): { item: HeaderMegaMenu, imageUrl: string } | null => {
        for (const item of items) {
            if (item.show_image && item.entity_data) {
                const extendedItem = item as ExtendedHeaderMegaMenu;
                // Deal case
                if (item.entity_type === 'deal' && extendedItem.entity_data?.image_url) {
                    return { item, imageUrl: extendedItem.entity_data.image_url };
                }
                // Product case
                if (
                    item.entity_type === 'product' &&
                    Array.isArray(item.entity_data.ProductImages) &&
                    item.entity_data.ProductImages.length > 0 &&
                    item.entity_data.ProductImages[0]?.image_url
                ) {
                    return { item, imageUrl: item.entity_data.ProductImages[0].image_url };
                }
            }
            if (item.children) {
                const found = findFirstImageItem(item.children);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // Helper: Recursively collect all menu items with show_image: true and a valid image
    const collectAllImageItems = useCallback((items: HeaderMegaMenu[]): { item: HeaderMegaMenu, imageUrl: string }[] => {
        let result: { item: HeaderMegaMenu, imageUrl: string }[] = [];
        for (const item of items) {
            if (item.show_image && item.entity_data) {
                const extendedItem = item as ExtendedHeaderMegaMenu;
                // Deal case
                if (
                    item.entity_type === 'deal' &&
                    typeof extendedItem.entity_data?.image_url === 'string' &&
                    extendedItem.entity_data.image_url
                ) {
                    result.push({ item, imageUrl: extendedItem.entity_data.image_url });
                }
                // Product case
                if (
                    item.entity_type === 'product' &&
                    Array.isArray(item.entity_data.ProductImages) &&
                    item.entity_data.ProductImages.length > 0 &&
                    typeof item.entity_data.ProductImages[0]?.image_url === 'string' &&
                    item.entity_data.ProductImages[0].image_url
                ) {
                    result.push({ item, imageUrl: item.entity_data.ProductImages[0].image_url });
                }
            }
            if (item.children) {
                result = result.concat(collectAllImageItems(item.children));
            }
        }
        return result;
    }, []);

    const shouldShowImageSection = hasAnyShowImage(menuItems);
    const allImageResults = collectAllImageItems(menuItems);

    return (
        <div className={`absolute left-0 top-full w-full border-t border-skin-neutral-200 shadow-card bg-skin-base z-20 px-12.5 py-9 transition-all duration-300 min-h-[250px] max-h-[300px] overflow-y-auto flex items-start justify-between opacity-0 invisible transform translate-y-4 ${isOpen ? '!opacity-100 !visible !translate-y-0' : ''}`}>
            <div className={`${shouldShowImageSection ? 'w-[68%] pr-7 border-r border-skin-neutral-200' : 'w-full'} space-y-6`}>
                <Form {...searchFromConfig}>
                    <form noValidate className="w-3/4">
                        <InputField
                            control={searchFromConfig.control}
                            name="search"
                            type={Header_FORM_CONFIG.SEARCH.TYPE}
                            placeholder="Search..."
                            className="w-3/4"
                            classNames={{
                                input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
                            }}
                            startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
                            value={searchKeyword}
                            onChange={handleSearchChange}
                        />
                    </form>
                </Form>

                {renderMenuColumns(filteredMenuItems)}
            </div>
            {/* Image section - enabled with dynamic handling */}
            {shouldShowImageSection && allImageResults.length > 0 && (
                <div className="w-[32%] space-y-6 pl-7 max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        {allImageResults.map(({ item, imageUrl }) => (
                            <Link href={item.original || '#'} key={item.id} className="block">
                                <div className="bg-white rounded-2xl shadow-md p-3 flex items-center justify-center">
                                    <Image
                                        src={imageUrl}
                                        alt={item.entity_data?.name || item.label}
                                        width={183}
                                        height={130}
                                        className="rounded-10"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};