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
interface ExtendedHeaderMegaMenu extends Omit<HeaderMegaMenu, 'entity_data' | 'hide_mobile_view' | 'hide_desktop_view'> {
    is_new?: boolean;
    is_hot?: boolean;
    hide_mobile_view?: boolean;
    hide_desktop_view?: boolean;
    image_url?: string | null; // image_url is now provided at top level by API
    entity_data?: HeaderMegaMenu['entity_data'] & {
        image_url?: string;
    };
}

export const MegaMenu: React.FC<{ isOpen: boolean; menuItems: HeaderMegaMenu[]; parentMenu?: HeaderMegaMenu | null }> = ({ isOpen, menuItems, parentMenu }) => {
  const router = useRouter();
    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const [searchKeyword, setSearchKeyword] = useState<string>('');

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
    const handleMenuClick = (original: string | null, entityType?: string) => {
        if (original && original !== '#') {
            if (entityType === 'brand') {
                router.push(`/brand${original}`);
            } else if (entityType === 'deal') {
                router.push(`/product-deals${original}`);
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
        // Filter and sort children by order to maintain API order
        const visibleChildren = menuItem.children && menuItem.children.length > 0 
            ? menuItem.children
                .filter(child => !child.hide_text)
                .sort((a, b) => {
                    if (a.order !== undefined && b.order !== undefined) {
                        return a.order - b.order;
                    }
                    return 0;
                })
            : [];

        // Check if any item in this tree has the flags
        const hasHotFlag = hasAnyFlag(menuItem, 'is_hot');
        const extendedMenuItem = menuItem as ExtendedHeaderMegaMenu;

        return (
            <div key={menuItem.id} className={`${shouldShowImageSection ? 'mb-4' : 'mb-2'}`}>
                {/* If item has visible children, show as header and render children */}
                {visibleChildren.length > 0 ? (
                    <>
                        <div className={`border-b border-skin-neutral-200 ${shouldShowImageSection ? 'mb-2 pb-2' : 'mb-1 pb-1'}`}>
                            <div className="flex items-center gap-2">
                                <h3 
                                    className={`text-title-2 font-bold text-skin-neutral-500 ${menuItem.original && menuItem.original !== '#' ? 'cursor-pointer hover:underline' : ''}`}
                                    onClick={() => {
                                        if (menuItem.original && menuItem.original !== '#') {
                                            handleMenuClick(menuItem.original, menuItem.entity_type);
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
                        <div className={`${shouldShowImageSection ? 'space-y-2' : 'space-y-1'}`}>
                            {visibleChildren.map((child) => (
                                <div key={child.id}>
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
                            handleMenuClick(menuItem.original, menuItem.entity_type);
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

    // Helper function to sort menu items by order field
    const sortMenuItemsByOrder = (items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
        return [...items].sort((a, b) => {
            // Sort by order field, maintaining API order
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            // If order is not defined, maintain original order
            return 0;
        }).map(item => {
            // Recursively sort children as well
            if (item.children && item.children.length > 0) {
                return {
                    ...item,
                    children: sortMenuItemsByOrder(item.children)
                };
            }
            return item;
        });
    };

    // Render menu items in columns with overflow handling
    const renderMenuColumns = (items: HeaderMegaMenu[]) => {
        const visibleItems = items.filter(item => !item.hide_text);
        if (visibleItems.length === 0) return null;

        // Sort items by order to maintain API order
        const sortedItems = sortMenuItemsByOrder(visibleItems);

        // Check if any items have children
        const hasChildren = sortedItems.some(item => item.children && item.children.length > 0);

        if (hasChildren) {
            // When items have children, always use 3 columns to display main menus as titles
            // Display items in rows, flowing horizontally (left to right)
            const itemsPerRow = 3;
            const rows: HeaderMegaMenu[][] = [];
            
            for (let i = 0; i < sortedItems.length; i += itemsPerRow) {
                rows.push(sortedItems.slice(i, i + itemsPerRow));
            }

            return (
                <div className="space-y-6">
                    {rows.map((rowItems, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-3 gap-8">
                            {Array.from({ length: itemsPerRow }, (_, colIdx) => (
                                <div key={colIdx} className="space-y-4">
                                    {rowItems[colIdx] && renderMenuItem(rowItems[colIdx])}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        } else {
            // When no child items, use dynamic columns based on image section
            if (!shouldShowImageSection) {
                // Dynamic column count based on item count for no image section
                let columnCount = 1;
                if (sortedItems.length >= 7) {
                    columnCount = 3;
                } else if (sortedItems.length >= 4) {
                    columnCount = 2;
                } else {
                    columnCount = 1;
                }

                // Display items in rows, flowing horizontally (left to right)
                const itemsPerRow = columnCount;
                const rows: HeaderMegaMenu[][] = [];
                
                for (let i = 0; i < sortedItems.length; i += itemsPerRow) {
                    rows.push(sortedItems.slice(i, i + itemsPerRow));
                }

                // Use conditional classes for grid columns (Tailwind requires full class names)
                const gridClass = columnCount === 3 ? 'grid-cols-3' : columnCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

                return (
                    <div className="space-y-6">
                        {rows.map((rowItems, rowIdx) => (
                            <div key={rowIdx} className={`grid ${gridClass} gap-8`}>
                                {Array.from({ length: itemsPerRow }, (_, colIdx) => (
                                    <div key={colIdx} className="space-y-3">
                                        {rowItems[colIdx] && renderMenuItem(rowItems[colIdx])}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            } else {
                // For image section: use 2 columns to maximize space
                // Display items in rows, flowing horizontally (left to right)
                const itemsPerRow = 2;
                const rows: HeaderMegaMenu[][] = [];
                
                for (let i = 0; i < sortedItems.length; i += itemsPerRow) {
                    rows.push(sortedItems.slice(i, i + itemsPerRow));
                }

                return (
                    <div className="space-y-6">
                        {rows.map((rowItems, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-2 gap-6">
                                {Array.from({ length: itemsPerRow }, (_, colIdx) => (
                                    <div key={colIdx} className="space-y-3">
                                        {rowItems[colIdx] && renderMenuItem(rowItems[colIdx])}
                                    </div>
                                ))}
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
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform visibility first
            if (isMobile && extendedItem.hide_mobile_view) continue;
            if (!isMobile && extendedItem.hide_desktop_view) continue;
            
            if (item.show_image) return true;
            if (item.children && hasAnyShowImage(item.children)) return true;
        }
        return false;
    }, [isMobile]);

    // Helper: Recursively find the first menu item with show_image: true and a valid image (deal or product)
    const findFirstImageItem = useCallback((items: HeaderMegaMenu[]): { item: HeaderMegaMenu, imageUrl: string } | null => {
        for (const item of items) {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform visibility first
            if (isMobile && extendedItem.hide_mobile_view) continue;
            if (!isMobile && extendedItem.hide_desktop_view) continue;
            
            if (item.show_image) {
                // Check for image_url at top level (now provided directly by API)
                if (extendedItem.image_url && typeof extendedItem.image_url === 'string' && extendedItem.image_url.trim() !== '') {
                    return { item, imageUrl: extendedItem.image_url };
                }
            }
            if (item.children) {
                const found = findFirstImageItem(item.children);
                if (found) return found;
            }
        }
        return null;
    }, [isMobile]);

    // Helper: Recursively collect all menu items with show_image: true and a valid image
    const collectAllImageItems = useCallback((items: HeaderMegaMenu[]): { item: HeaderMegaMenu, imageUrl: string }[] => {
        let result: { item: HeaderMegaMenu, imageUrl: string }[] = [];
        for (const item of items) {
            const extendedItem = item as ExtendedHeaderMegaMenu;
            
            // Check platform visibility first
            if (isMobile && extendedItem.hide_mobile_view) continue;
            if (!isMobile && extendedItem.hide_desktop_view) continue;
            
            if (item.show_image) {
                // Check for image_url at top level (now provided directly by API)
                if (extendedItem.image_url && typeof extendedItem.image_url === 'string' && extendedItem.image_url.trim() !== '') {
                    result.push({ item, imageUrl: extendedItem.image_url });
                }
            }
            if (item.children) {
                result = result.concat(collectAllImageItems(item.children));
            }
        }
        return result;
    }, [isMobile]);

    const shouldShowImageSection = hasAnyShowImage(menuItems);
    const allImageResults = collectAllImageItems(menuItems);
    // Get parent menu image if available
    const parentMenuExtended = parentMenu as ExtendedHeaderMegaMenu | undefined;
    const parentMenuImageUrl = parentMenuExtended?.image_url;

    // Helper function to get navigation href for parent menu
    const getParentMenuHref = () => {
        if (!parentMenu) return '#';
        if (parentMenu.entity_type === 'brand') {
            const slug = parentMenu.entity_data?.slug || parentMenu.original?.split('/').pop() || '';
            return `/brand/${slug}`;
        }
        if (parentMenu.entity_type === 'deal') {
            const slug = parentMenu.entity_data?.slug || parentMenu.original?.split('/').pop() || '';
            return `/product-deals/${slug}`;
        }
        return parentMenu.original || '#';
    };

    return (
        <div className={`absolute left-0 right-0 top-[100%] w-full shadow-card bg-skin-base z-20 px-12.5 py-9 transition-all duration-500 ease-in min-h-[250px] max-h-[400px] overflow-y-auto flex items-start justify-between invisible transform pointer-events-none max-w-[1520px] mx-auto ${isOpen ? '!visible pointer-events-auto' : ''}`}>
            <div className={`${(parentMenuImageUrl || allImageResults.length > 0) ? 'w-[68%] pr-7 border-r border-skin-neutral-200' : 'w-full'} space-y-6`}>
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
            {/* Image section - show parent menu image in same row as child images */}
            {(parentMenuImageUrl || (shouldShowImageSection && allImageResults.length > 0)) && (
                <div className="w-[32%] space-y-6 pl-7 max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Parent menu main image - same size as child images */}
                        {parentMenuImageUrl && (
                            <Link href={getParentMenuHref()} className="block">
                                <div className="bg-white rounded-2xl shadow-md p-3">
                                    <div className="relative w-full h-[100px]">
                                        <Image
                                            src={parentMenuImageUrl}
                                            alt={parentMenu?.alt_text || parentMenu?.label || ''}
                                            fill
                                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            className="object-contain rounded-10"
                                        />
                                    </div>
                                    {/* {parentMenu && (
                                        <h3 className="text-content-2 font-semibold text-skin-neutral-500 text-center line-clamp-2">
                                            {parentMenu.label}
                                        </h3>
                                    )} */}
                                </div>
                            </Link>
                        )}
                        
                        {/* Child menu images */}
                        {shouldShowImageSection && allImageResults.length > 0 && allImageResults.map(({ item, imageUrl }) => {
                            const getHref = () => {
                                if (item.entity_type === 'brand') {
                                    return `/brand${item.original}`;
                                }
                                if (item.entity_type === 'deal') {
                                    return `/product-deals${item.original}`;
                                }
                                return item.original || '#';
                            };
                            return (
                                <Link href={getHref()} key={item.id} className="block">
                                    <div className="bg-white rounded-2xl shadow-md p-3">
                                        <div className="relative w-full h-[100px]">
                                            <Image
                                                src={imageUrl}
                                                alt={item.alt_text || item.entity_data?.alt_text || item.label}
                                                fill
                                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                                className="object-contain rounded-10"
                                            />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};