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
    }, [menuItems, getAllMenuItems]);

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

    // Render a single menu item with its children
    const renderMenuItem = (menuItem: HeaderMegaMenu, level = 0) => {
        const visibleChildren = menuItem.children && menuItem.children.length > 0 
            ? menuItem.children.filter(child => !child.hide_text) 
            : [];

        return (
            <div key={menuItem.id} className="mb-4">
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

    // Render menu items in columns with overflow handling
    const renderMenuColumns = (items: HeaderMegaMenu[]) => {
        // Filter items based on hide_text - only show items where hide_text is false
        const visibleItems = items.filter(item => !item.hide_text);
        
        if (visibleItems.length === 0) return null;

        // Always show first 4 items in columns
        const firstFourItems = visibleItems.slice(0, 4);
        const remainingItems = visibleItems.slice(4);

        return (
            <div className="space-y-6">
                {/* First 4 items in columns */}
                <div className="grid grid-cols-4 gap-8">
                    {firstFourItems.map((item, index) => (
                        <div key={index} className="space-y-4 border-r border-skin-neutral-200 last:border-r-0 pr-6">
                            {renderMenuItem(item)}
                        </div>
                    ))}
                </div>

                {/* Remaining items in a separate section */}
                {remainingItems.length > 0 && (
                    <div className="border-t border-skin-neutral-200 pt-6">
                        <div className="grid grid-cols-4 gap-8">
                            {remainingItems.map((item, index) => (
                                <div key={index} className="space-y-4 border-r border-skin-neutral-200 last:border-r-0 pr-6">
                                    {renderMenuItem(item)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`absolute left-0 -bottom-[420px] w-full border-t border-skin-neutral-200 shadow-card bg-skin-base z-20 px-12.5 py-9 transition-all duration-300 min-h-[428px] max-h-[500px] overflow-y-auto flex items-start opacity-0 invisible transform translate-y-4 ${isOpen ? '!opacity-100 !visible !translate-y-0' : ''}`}>
            <div className="w-[75%] space-y-6 pr-7 border-r border-skin-neutral-200">
                <Form {...searchFromConfig}>
                    <form noValidate className="w-full">
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
            <div className="w-[25%] space-y-6 pl-7">
                <div className="grid grid-cols-1 gap-3">
                    {productItems.map(product => (
                        <Link href={product.original || '#'} key={product.id} className="block">
                            <div className="relative overflow-hidden rounded-lg">
                                <Image
                                    src={product.entity_data?.ProductImages?.[0]?.image_url || '/images/no-image.png'}
                                    alt={product.entity_data?.name || product.label}
                                    width={150}
                                    height={90}
                                    className="w-full h-20 object-cover transition-transform hover:scale-105"
                                />
                                {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <h4 className="text-white text-xs font-semibold truncate">
                                        {product.entity_data?.name || product.label}
                                    </h4>
                                    {product.entity_data?.price && (
                                        <p className="text-white/90 text-xs">
                                            £{product.entity_data.price}
                                        </p>
                                    )}
                                </div> */}
                            </div>
                        </Link>
                    ))}
                    {productItems.length < 3 && Array.from({ length: 3 - productItems.length }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="relative overflow-hidden rounded-lg bg-gray-100">
                            <div className="h-20 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-6 h-6 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-xs">No Image Available</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Deals section */}
                {/* {deals.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-skin-neutral-500 border-b border-skin-neutral-200 pb-2">
                            Multibuy Deals
                        </h3>
                        <div className="space-y-2">
                            {deals.map((deal) => (
                                <Link 
                                    key={deal.id} 
                                    href={`/product-deals/${deal.slug}`} 
                                    className="block text-skin-neutral-300 font-medium text-sm hover:text-skin-neutral-500 hover:underline transition-colors"
                                >
                                    {deal.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};
