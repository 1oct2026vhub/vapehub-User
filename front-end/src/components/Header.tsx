"use client"
import React from 'react'
import HeaderTopBar from "@/components/HeaderTopBar";
import NavigationMenu from "@/components/NavigationMenu";
import { FlashNewsItem } from '@/lib/config/global.config';
import PromotionBanner from "@/components/ui/PromotionBanner";
import HeaderFeatures from '@/components/HeaderFeatures';
import { HeaderMegaMenuResponse, HeaderMegaMenu } from '@/lib/config/header.config';
import { Category } from '@/lib/config/category.config';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    megaMenu: HeaderMegaMenuResponse;
    flashNews: FlashNewsItem[];
}

// Convert HeaderMegaMenu to Category
const convertToCategories = (menus: HeaderMegaMenu[]): Category[] => {
    return menus.map(menu => ({
        id: menu.id,
        parent_id: menu.menu_parent,
        name: menu.label,
        slug: menu.original || '',
        logo_url: menu.icon || '',
        description: menu.entity_data?.name || '',
        status: menu.status,
        order: menu.order,
        updated_by: menu.updated_by.toString(),
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        deletedAt: menu.deletedAt,
        subCategories: menu.children ? convertToCategories(menu.children) : [],
        severity: 'normal' as const
    }));
};

const Header: React.FC<HeaderProps> = ({ megaMenu, flashNews }) => {
    const pathname = usePathname();
    const isVerificationPage = pathname.includes('/verify-email');

    // Filter out menus that have hide_text set to true
    const visibleMenus = megaMenu.data.filter(menu => !menu.hide_text);

    // Convert visible menus to categories
    const visibleCategories = convertToCategories(visibleMenus);

    return (
        <>
            {!isVerificationPage && <PromotionBanner messages={flashNews} />}
            <header className="px-4 lg:px-9 xl:px-12.5 pt-3.5 pb-2.5 lg:py-9.5 border-b border-skin-primary-300 flex flex-col gap-9 bg-header-gradient relative">
                <HeaderTopBar categories={visibleCategories} megaMenuData={visibleMenus}/>
                {!isVerificationPage && <NavigationMenu menus={megaMenu.data}/>}
            </header>
            <HeaderFeatures />
        </>
    )
}

export default Header